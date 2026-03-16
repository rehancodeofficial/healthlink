import { useState, useEffect, useRef } from "react";
import Video from "twilio-video";
import io from "socket.io-client";
import { toast } from "react-toastify";
import api from "../Lib/api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export const useVideoSession = ({ token, roomName, appointmentId, isDoctor }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // Initialize Socket
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected for video session");
      if (roomName && appointmentId) {
        socketRef.current.emit("join_room", {
          roomId: roomName,
          appointmentId: appointmentId,
        });
      }
    });

    socketRef.current.on("session_replaced", () => {
      toast.warning("Active session detected in another window. Disconnecting...");
      disconnect();
    });

    socketRef.current.on("error", (err) => {
      console.error("Socket error:", err);
      toast.error(err.message || "Connection error");
    });

    socketRef.current.on("session_ended", () => {
      toast.info("Session ended by the doctor.");
      disconnect();
    });

    socketRef.current.on("user_left", ({ user }) => {
      if (user) {
        toast.info(`${user.name} left the session.`);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomName, appointmentId]);

  // Connect to Twilio Video
  useEffect(() => {
    if (!token || !roomName) return;

    const connectToRoom = async () => {
      try {
        console.log("Connecting to Twilio Room:", roomName);
        const videoRoom = await Video.connect(token, {
          name: roomName,
          audio: true,
          video: { width: 640, height: 480, facingMode: "user" },
          dominantSpeaker: true,
        });

        setRoom(videoRoom);
        setIsConnected(true);
        setParticipants(Array.from(videoRoom.participants.values()));

        // Event listeners
        videoRoom.on("participantConnected", (participant) => {
          console.log(`Participant connected: ${participant.identity}`);
          setParticipants((prev) => [...prev, participant]);
          toast.success("Participant joined");
        });

        videoRoom.on("participantDisconnected", (participant) => {
          console.log(`Participant disconnected: ${participant.identity}`);
          setParticipants((prev) => prev.filter((p) => p !== participant));
          toast.info("Participant disconnected");
        });

        videoRoom.on("disconnected", () => {
          setRoom(null);
          setIsConnected(false);
          setParticipants([]);
        });

        // Notify socket that doctor started session
        if (isDoctor && socketRef.current) {
          // Need doctorName and patientId appropriately.
          // For now, we assume the backend handles lookup or we pass simple status
          // Actually, we need to emit 'start_session' with details.
          // But 'join_room' usually happens first.
          // Let's assume the user invokes startSession explicitly.
        }
      } catch (err) {
        console.error("Failed to connect to video room:", err);
        setError(err);
        toast.error(`Connection failed: ${err.message}`);
      }
    };

    connectToRoom();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [token, roomName, isDoctor]);

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

  const disconnect = () => {
    if (room) {
      room.disconnect();
    }
    setIsConnected(false);
  };

  return { room, participants, isConnected, error, startSession, endSession, disconnect };
};
