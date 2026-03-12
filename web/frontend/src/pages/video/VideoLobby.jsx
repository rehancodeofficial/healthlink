import { useState } from "react";
import api from "../../Lib/api";
import { useNavigate } from "react-router-dom";

export default function VideoLobby() {
  const [identity, setIdentity] = useState(localStorage.getItem("userName") || "");
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!identity || !roomName) return alert("Enter your name and room ID");

    setLoading(true);
    try {
      const res = await api.post("/videocall/token", { identity, roomName });
      const { token } = res.data;
      localStorage.setItem("twilioToken", token);
      localStorage.setItem("roomName", roomName);
      navigate(`/video/room/${roomName}`);
    } catch (err) {
      console.error("Error generating Twilio token:", err);
      alert("Failed to connect to video service");
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
