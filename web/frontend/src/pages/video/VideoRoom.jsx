import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { toast } from "react-toastify";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
    // Add TURN server for production (optional)
    // { urls: "turn:turnserver.example.com:3478", username: "user", credential: "pass" },
  ],
};

export default function VideoRoom() {
  const { roomName } = useParams();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [connectionState, setConnectionState] = useState("new");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [iceServers, setIceServers] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const hasJoinedRoom = useRef(false);
  const hasFetchedIce = useRef(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsDoctor(role === "DOCTOR");

    // Fetch ICE servers
    const fetchIceServers = async () => {
      if (hasFetchedIce.current) return;
      hasFetchedIce.current = true;

      try {
        const token = localStorage.getItem("token");
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"; // Fallback if env missing
        // Construct URL correctly - remove /api if backendUrl already has it, or ensure it's there
        // Assuming VITE_BACKEND_URL usually ends with /api based on previous contexts
        const baseUrl = backendUrl.endsWith("/api") ? backendUrl : `${backendUrl}/api`;

        const response = await fetch(`${baseUrl}/webrtc/ice-servers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch ICE servers");

        const data = await response.json();
        if (data.success && data.iceServers) {
          console.log("✅ Fetched dynamic ICE servers");
          setIceServers(data.iceServers);
        } else {
          throw new Error("Invalid ICE server data");
        }
      } catch (error) {
        console.error("Failed to fetch ICE servers:", error);
        // Fallback to Google STUN if fetch fails
        setIceServers([
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ]);
      }
    };

    fetchIceServers();
  }, []);

  useEffect(() => {
    if (!socket || !isConnected || !iceServers) {
      if (!iceServers) setStatus("Loading connection config...");
      else setStatus("Waiting for connection...");
      return;
    }

    if (hasJoinedRoom.current) return;
    hasJoinedRoom.current = true;

    // 1. Join the room securely
    // Assuming roomName is the appointmentId/roomId
    console.log(`Joining room ${roomName} with appointmentId ${roomName}`);
    socket.emit("join_room", {
      roomId: roomName,
      appointmentId: roomName,
    });
    setStatus("Joining room...");

    // 2. Setup WebRTC PeerConnection
    setupPeerConnection();

    // 3. Get Local Media
    getLocalMedia();

    // 4. Socket Event Listeners
    setupSocketListeners();

    return () => {
      cleanup();
    };
  }, [socket, isConnected, roomName, iceServers]);

  const setupPeerConnection = () => {
    if (!iceServers) return;

    console.log("🛠️ Creating RTCPeerConnection with servers:", iceServers);
    peerConnection.current = new RTCPeerConnection({ iceServers });

    // ICE Candidate handling
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 Sending ICE candidate");
        socket.emit("ice_candidate", {
          candidate: event.candidate,
          roomId: roomName,
        });
      }
    };

    // Track when remote stream arrives
    peerConnection.current.ontrack = (event) => {
      console.log("📹 Remote track received");
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Connection state monitoring (ICE)
    peerConnection.current.oniceconnectionstatechange = () => {
      const state = peerConnection.current.iceConnectionState;
      console.log("🔌 ICE Connection State:", state);
      setConnectionState(state);

      switch (state) {
        case "checking":
          setStatus("Connecting...");
          break;
        case "connected":
        case "completed":
          setStatus("Connected");
          toast.success("Video call connected!");
          break;
        case "failed":
          setStatus("Connection failed. Retrying...");
          restartIce();
          break;
        case "disconnected":
          setStatus("Disconnected");
          break;
        case "closed":
          setStatus("Call Ended");
          break;
      }

      // Emit connection state to server
      socket.emit("connection_state", {
        roomId: roomName,
        state,
      });
    };

    // Connection state change (PeerConnection)
    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current.connectionState;
      console.log("🔗 Connection State:", state);

      if (state === "failed") {
        console.log("🔄 Attempting ICE restart...");
        restartIce();
      }
    };
  };

  const getLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      setStatus("Waiting for other participant...");
    } catch (err) {
      console.error("❌ Error accessing media devices:", err);
      setStatus("Error: Camera/Mic access denied");
      toast.error("Failed to access camera/microphone. Please grant permissions and refresh.");
    }
  };

  const setupSocketListeners = () => {
    // When another user connects, create offer
    socket.on("user_connected", async (data) => {
      console.log("👤 User connected:", data);
      setStatus("Participant joined. Connecting...");

      // Only create offer if we're the first one (or doctor)
      if (isDoctor || !peerConnection.current.localDescription) {
        await createOffer();
      }
    });

    // Listen for room users (already present)
    socket.on("room_users", async (data) => {
      console.log("👥 Room users:", data);
      if (data.users && data.users.length > 0) {
        setStatus("Connecting to participant...");
        // Wait a bit for tracks, then create offer
        setTimeout(() => createOffer(), 500);
      }
    });

    // Receive WebRTC offer
    socket.on("offer", async (offer) => {
      console.log("📨 Received offer");
      await handleOffer(offer);
    });

    // Receive WebRTC answer
    socket.on("answer", async (answer) => {
      console.log("📨 Received answer");
      await handleAnswer(answer);
    });

    // Receive ICE candidate
    socket.on("ice_candidate", async (candidate) => {
      console.log("📨 Received ICE candidate");
      await handleIceCandidate(candidate);
    });

    // Peer left
    socket.on("peer_left", (data) => {
      console.log("👋 Peer left:", data);
      toast.info("Other participant left the call");
      setStatus("Participant left");
      setRemoteStream(null);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    // Session ended by other party
    socket.on("session_ended", () => {
      toast.info("Session ended by other participant");
      setTimeout(() => navigate("/video/lobby"), 2000);
    });
  };

  const createOffer = async () => {
    try {
      if (!peerConnection.current) return;

      console.log("🤝 Creating offer...");
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("offer", {
        offer,
        roomId: roomName,
      });

      setStatus("Sending connection request...");
    } catch (err) {
      console.error("❌ Error creating offer:", err);
      toast.error("Failed to create connection offer");
    }
  };

  const handleOffer = async (offer) => {
    try {
      if (!peerConnection.current) return;

      console.log("🤝 Handling offer...");
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

      // Process queued ICE candidates now that we have remote description
      processQueuedIceCandidates();

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", {
        answer,
        roomId: roomName,
      });

      setStatus("Connecting...");
    } catch (err) {
      console.error("❌ Error handling offer:", err);
      toast.error("Failed to process connection request");
    }
  };

  const handleAnswer = async (answer) => {
    try {
      if (!peerConnection.current) return;

      console.log("🤝 Handling answer...");
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));

      // Process queued ICE candidates
      processQueuedIceCandidates();
    } catch (err) {
      console.error("❌ Error handling answer:", err);
      toast.error("Failed to establish connection");
    }
  };

  const handleIceCandidate = async (candidate) => {
    try {
      if (!peerConnection.current) return;

      // If we don't have remote description yet, queue the candidate
      if (!peerConnection.current.remoteDescription) {
        console.log("📦 Queueing ICE candidate (no remote description yet)");
        iceCandidatesQueue.current.push(candidate);
        return;
      }

      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("✅ Added ICE candidate");
    } catch (err) {
      console.error("❌ Error adding ICE candidate:", err);
    }
  };

  const processQueuedIceCandidates = async () => {
    if (iceCandidatesQueue.current.length === 0) return;

    console.log(`📦 Processing ${iceCandidatesQueue.current.length} queued ICE candidates`);

    for (const candidate of iceCandidatesQueue.current) {
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("❌ Error adding queued ICE candidate:", err);
      }
    }

    iceCandidatesQueue.current = [];
  };

  const restartIce = async () => {
    try {
      if (!peerConnection.current) return;

      const offer = await peerConnection.current.createOffer({ iceRestart: true });
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("offer", {
        offer,
        roomId: roomName,
      });

      toast.info("Attempting to reconnect...");
    } catch (err) {
      console.error("❌ ICE restart failed:", err);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        toast.info(audioTrack.enabled ? "Microphone ON" : "Microphone OFF");
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        toast.info(videoTrack.enabled ? "Camera ON" : "Camera OFF");
      }
    }
  };

  const handleEndCall = () => {
    // Notify other participant
    socket.emit("end_session", { roomId: roomName });

    cleanup();
    navigate("/video/lobby");
  };

  const cleanup = () => {
    // Stop local media tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        console.log("🛑 Stopped track:", track.kind);
      });
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Remove socket listeners
    if (socket) {
      socket.emit("leave_room", roomName);
      socket.off("user_connected");
      socket.off("room_users");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice_candidate");
      socket.off("peer_left");
      socket.off("session_ended");
    }

    console.log("🧹 Cleanup completed");
  };

  // Get status color
  const getStatusColor = () => {
    if (connectionState === "connected" || connectionState === "completed") {
      return "bg-green-100 text-green-700";
    }
    if (connectionState === "checking" || connectionState === "new") {
      return "bg-yellow-100 text-yellow-700";
    }
    if (connectionState === "disconnected") {
      return "bg-orange-100 text-orange-700";
    }
    if (connectionState === "failed" || connectionState === "closed") {
      return "bg-red-100 text-red-700";
    }
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center p-4">
      <header className="w-full max-w-6xl flex justify-between items-center mb-6 p-4 bg-[var(--bg-card)] rounded-xl shadow-sm">
        <h1 className="text-xl font-bold text-[var(--brand-green)]">Video Consultation</h1>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor()}`}>
            {status}
          </span>
          <button
            onClick={handleEndCall}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            End Call
          </button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Remote Video (Main View) */}
        <div className="bg-black rounded-2xl overflow-hidden relative shadow-lg aspect-video md:aspect-auto md:h-[600px] flex items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50 animate-pulse">
              <p>Waiting for remote video...</p>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-xs">
            Remote User
          </div>
        </div>

        {/* Local Video */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden relative shadow-lg aspect-video md:aspect-auto md:h-[600px] flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-xs">
            You {!videoEnabled && "(Camera Off)"}
          </div>

          {/* Media Controls */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition ${
                audioEnabled ? "bg-white/20 hover:bg-white/30" : "bg-red-500 hover:bg-red-600"
              }`}
              title={audioEnabled ? "Mute" : "Unmute"}
            >
              {audioEnabled ? "🎤" : "🔇"}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition ${
                videoEnabled ? "bg-white/20 hover:bg-white/30" : "bg-red-500 hover:bg-red-600"
              }`}
              title={videoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {videoEnabled ? "📹" : "📵"}
            </button>
          </div>
        </div>
      </div>

      {/* Connection Debug Info (only in development) */}
      {import.meta.env.DEV && (
        <div className="mt-4 p-4 bg-gray-800 text-white text-xs rounded max-w-6xl w-full">
          <p>ICE State: {connectionState}</p>
          <p>Socket Connected: {isConnected ? "✅" : "❌"}</p>
          <p>Local Stream: {localStream ? "✅" : "❌"}</p>
          <p>Remote Stream: {remoteStream ? "✅" : "❌"}</p>
        </div>
      )}
    </div>
  );
}
