import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { toast } from "react-toastify";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

export default function VideoRoom() {
  const { roomName } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [status, setStatus] = useState("Initializing...");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem("role"); // "DOCTOR" or "PATIENT"
    setIsDoctor(role === "DOCTOR");
  }, []);

  useEffect(() => {
    if (!socket) return;

    // 1. Join the room
    socket.emit("join_room", roomName);
    setStatus("Waiting for other participant...");

    // 2. Setup WebRTC PeerConnection
    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice_candidate", { candidate: event.candidate, roomId: roomName });
      }
    };

    peerConnection.current.ontrack = (event) => {
      console.log("Remote track received");
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setStatus("Connected");
    };

    // 3. Get Local Media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        // If Doctor, inform server to notify patient (optional session start trigger)
        // But mainly, we listen for 'user_connected' to initiate offer
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
        setStatus("Error: Could not access camera/mic");
        toast.error("Failed to access camera/microphone");
      });

    // 4. Socket Event Listeners

    // When a user connects, if I am the "initiator" (e.g., Doctor or just existing user), I create an offer
    // Simplified: Just respond to 'user_connected'
    socket.on("user_connected", async () => {
      console.log("User connected, creating offer...");
      setStatus("Connecting...");
      try {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("offer", { offer, roomId: roomName });
      } catch (err) {
        console.error("Error creating offer:", err);
      }
    });

    socket.on("offer", async (offer) => {
      console.log("Received offer");
      setStatus("Connecting...");
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", { answer, roomId: roomName });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socket.on("answer", async (answer) => {
      console.log("Received answer");
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        setStatus("Connected");
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    });

    socket.on("ice_candidate", async (candidate) => {
      console.log("Received ICE candidate");
      try {
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    // Handle session start logic for Doctor
    // If I'm the doctor, I might want to emit 'start_session' explicitly to notify waiting patients
    if (localStorage.getItem("role") === "DOCTOR") {
      socket.emit("start_session", {
        roomId: roomName,
        doctorName: localStorage.getItem("userName") || "Doctor",
      });
    }

    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      socket.off("user_connected");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice_candidate");
      socket.emit("leave_room", roomName); // Optional
    };
  }, [socket, roomName]); // Run once on mount (dependency on socket/roomName)

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    navigate("/video/lobby");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center p-4">
      <header className="w-full max-w-6xl flex justify-between items-center mb-6 p-4 bg-[var(--bg-card)] rounded-xl shadow-sm">
        <h1 className="text-xl font-bold text-[var(--brand-green)]">Video Consultation</h1>
        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${status === "Connected" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
          >
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

        {/* Local Video (PiP or Side) */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden relative shadow-lg aspect-video md:aspect-auto md:h-[600px] flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror local video
          />
          <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-xs">
            You
          </div>
        </div>
      </div>
    </div>
  );
}
