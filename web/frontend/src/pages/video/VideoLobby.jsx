import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { toast } from "react-toastify";

export default function VideoLobby() {
  const [identity, setIdentity] = useState(localStorage.getItem("userName") || "");
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionNotification, setSessionNotification] = useState(null); // { doctorName, roomId, appointmentId }
  const navigate = useNavigate();
  const { socket, isConnected, connectionState } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleSessionStarted = ({ doctorName, roomId, appointmentId }) => {
      console.log("🔔 Session started notification:", { doctorName, roomId, appointmentId });

      // Show persistent notification
      setSessionNotification({ doctorName, roomId, appointmentId });

      // Also show toast
      toast.success(`Dr. ${doctorName} has started the session!`, {
        autoClose: 8000,
      });
    };

    socket.on("session_started", handleSessionStarted);

    return () => {
      socket.off("session_started", handleSessionStarted);
    };
  }, [socket]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!identity || !roomName) {
      toast.error("Please enter your name and room ID");
      return;
    }

    if (!isConnected) {
      toast.error("Not connected to server. Please wait...");
      return;
    }

    setLoading(true);
    try {
      // Store in localStorage
      localStorage.setItem("roomName", roomName);
      localStorage.setItem("userName", identity);

      // Navigate to video room
      navigate(`/video/room/${roomName}`);
    } catch (err) {
      console.error("Error joining room:", err);
      toast.error("Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinNotification = () => {
    if (!sessionNotification) return;

    const { roomId } = sessionNotification;
    setRoomName(roomId);
    localStorage.setItem("roomName", roomId);

    // Navigate directly
    navigate(`/video/room/${roomId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]/90 text-[var(--text-main)] p-4">
      <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-400">Join Consultation</h1>

        {/* Session Notification Banner */}
        {sessionNotification && (
          <div className="mb-6 p-4 bg-green-500/10 border-2 border-green-500 rounded-xl animate-pulse">
            <p className="text-green-500 font-bold mb-2 text-center">
              🎥 Dr. {sessionNotification.doctorName} is ready!
            </p>
            <p className="text-xs text-center text-[var(--text-soft)] mb-3">
              Session ID: {sessionNotification.roomId}
            </p>
            <button
              onClick={handleJoinNotification}
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition"
            >
              Join Now
            </button>
          </div>
        )}

        {/* Connection Status */}
        <div className="mb-4 text-center">
          <span
            className={`text-xs font-bold ${isConnected ? "text-green-500" : "text-yellow-500"}`}
          >
            {connectionState === "connected"
              ? "✅ Connected"
              : connectionState === "connecting"
                ? "🔄 Connecting..."
                : connectionState === "reconnecting"
                  ? "🔄 Reconnecting..."
                  : "⚠️ Disconnected"}
          </span>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-bold">Your Name</label>
            <input
              type="text"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              className="w-full p-3 rounded-lg bg-[var(--bg-glass)] border border-[var(--border)] focus:border-[var(--brand-green)] outline-none"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-bold">Room ID</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-3 rounded-lg bg-[var(--bg-glass)] border border-[var(--border)] focus:border-[var(--brand-green)] outline-none"
              placeholder="Enter room ID (e.g., consult_123)"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isConnected}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Joining..." : "Join Room"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--text-soft)]">
          <p>Make sure your camera and microphone are enabled</p>
        </div>
      </div>
    </div>
  );
}
