import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { toast } from "react-toastify";

export default function VideoLobby() {
  const [identity, setIdentity] = useState(localStorage.getItem("userName") || "");
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleSessionStarted = ({ doctorName, roomId }) => {
      toast.info(`👨‍⚕️ Doctor ${doctorName} has started the session! Click 'Join' to enter.`, {
        autoClose: false,
        onClick: () => {
          setRoomName(roomId);
          navigate(`/video/room/${roomId}`);
        },
      });
    };

    socket.on("session_started", handleSessionStarted);

    return () => {
      socket.off("session_started", handleSessionStarted);
    };
  }, [socket, navigate]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!identity || !roomName) return alert("Enter your name and room ID");

    setLoading(true);
    try {
      // We no longer need Twilio token, just join the room via route
      // Optionally, validate room existence via API if needed
      localStorage.setItem("roomName", roomName);
      localStorage.setItem("userName", identity);

      // Emit join event to socket immediately or handle it in VideoRoom
      // For now, we'll let VideoRoom handle the socket join

      navigate(`/video/room/${roomName}`);
    } catch (err) {
      console.error("Error joining room:", err);
      alert("Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-400">Join Consultation</h1>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block mb-1">Your Name</label>
            <input
              type="text"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              className="w-full p-2 rounded bg-[var(--bg-glass)] border border-[var(--border)]"
            />
          </div>
          <div>
            <label className="block mb-1">Room ID</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-2 rounded bg-[var(--bg-glass)] border border-[var(--border)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-md text-[var(--text-main)] font-semibold"
          >
            {loading ? "Connecting..." : "Join Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
