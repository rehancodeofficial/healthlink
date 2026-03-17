import { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";
import api from "../Lib/api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export const useVideoSession = ({ roomName, appointmentId, isDoctor }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamUtils = useRef(new MediaStream());

  // Track cleanup
  const cleanupRef = useRef(false);

  /* ------------------- DISCONNECT LOGIC ------------------- */
  const disconnect = useCallback(() => {
    cleanupRef.current = true;

    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close PeerConnection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Disconnect Socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setRoom(null);
    setParticipants([]);
    setIsConnected(false);
    console.log("⏹️ Video session disconnected");
  }, []);

  /* ------------------- MAIN EFFECT ------------------- */
  useEffect(() => {
    if (!roomName || !appointmentId) return;

    const token = localStorage.getItem("token"); // Auth token for socket

    /* ------------------- SIGNALING HELPERS ------------------- */
    const createPeerConnection = async (iceServers) => {
      const pc = new RTCPeerConnection({
        iceServers: iceServers,
        iceTransportPolicy: "all",
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          //console.log("❄️ Sending ICE Candidate");
          socketRef.current.emit("ice-candidate", {
            roomId: roomName,
            candidate: event.candidate,
          });
        }
      };

      // Handle Connection State
      pc.onconnectionstatechange = () => {
        console.log("🔄 Connection State:", pc.connectionState);
        if (pc.connectionState === "failed") {
          console.warn("⚠️ Connection failed, attempting restart...");
          pc.restartIce();
        }
      };

      // Handle Remote Track
      pc.ontrack = (event) => {
        console.log("🎥 Received remote track:", event.track.kind);
        event.streams[0].getTracks().forEach((track) => {
          remoteStreamUtils.current.addTrack(track);
        });
        // Force update to re-render
        setParticipants((prev) => [...prev]);
      };

      return pc;
    };

    const init = async () => {
      try {
        console.log("🚀 Initializing Video Session...");

        // 1. Fetch ICE Servers (Twilio / TURN)
        let iceServers = [];
        try {
          const res = await api.get("/webrtc/ice-servers");
          if (res.data?.success) {
            iceServers = res.data.iceServers;
            console.log("✅ Fetched ICE servers", iceServers.length);
          }
        } catch (e) {
          console.error("⚠️ Failed to fetch ICE servers, using public STUN", e);
          iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
        }

        // 2. Initialize Socket
        socketRef.current = io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
        });

        // 3. Get Local Media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
          audio: true,
        });
        localStreamRef.current = stream;

        // 4. Create Peer Connection
        const pc = await createPeerConnection(iceServers);
        peerConnectionRef.current = pc;

        // Add local tracks to PC
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // 5. Socket Event Listeners
        socketRef.current.on("connect", () => {
          console.log("✅ Socket Connected");
          socketRef.current.emit("join_room", { roomId: roomName, appointmentId });
          setIsConnected(true);
        });

        // SIGNALING: Handle 'user_connected' - Initiator Logic
        socketRef.current.on("user_connected", async () => {
          console.log("👤 User connected -> Creating Offer");
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current.emit("offer", { roomId: roomName, offer });
          } catch (err) {
            console.error(err);
          }
        });

        socketRef.current.on("offer", async ({ offer }) => {
          console.log("📩 Received Offer");
          try {
            if (pc.signalingState !== "stable") {
              await Promise.all([
                pc.setLocalDescription({ type: "rollback" }),
                pc.setRemoteDescription(offer),
              ]);
            } else {
              await pc.setRemoteDescription(offer);
            }
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketRef.current.emit("answer", { roomId: roomName, answer });
          } catch (err) {
            console.error(err);
          }
        });

        socketRef.current.on("answer", async ({ answer }) => {
          console.log("📩 Received Answer");
          try {
            await pc.setRemoteDescription(answer);
          } catch (err) {
            console.error(err);
          }
        });

        socketRef.current.on("ice-candidate", async ({ candidate }) => {
          try {
            if (candidate) await pc.addIceCandidate(candidate);
          } catch (err) {
            console.error(err);
          }
        });

        // Session events
        socketRef.current.on("session_ended", () => {
          toast.info("Session ended.");
          disconnect();
        });

        socketRef.current.on("user_left", () => {
          toast.info("User left.");
          // Clear remote stream visual
          remoteStreamUtils.current = new MediaStream(); // Clear tracks
          setParticipants([]);
        });

        setRoom({
          localStream: stream,
          remoteStream: remoteStreamUtils.current,
          socket: socketRef.current,
        });
      } catch (err) {
        console.error("❌ Initialization Error:", err);
        setError(err);
        toast.error("Failed to access camera/microphone");
      }
    };

    init();

    return () => {
      disconnect();
    };
  }, [roomName, appointmentId, disconnect]);

  const startSession = (doctorName, patientId) => {
    if (socketRef.current && isDoctor) {
      socketRef.current.emit("start_session", {
        roomId: roomName,
        appointmentId,
        doctorName,
        patientId,
      });
    }
  };

  const endSession = () => {
    if (socketRef.current && isDoctor) {
      socketRef.current.emit("end_session", { roomId: roomName });
    }
    disconnect();
  };

  return {
    room,
    participants,
    isConnected,
    error,
    startSession,
    endSession,
    disconnect,
    localStream: localStreamRef.current,
    remoteStream: remoteStreamUtils.current,
  };
};
