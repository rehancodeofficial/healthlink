import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaVideo, FaShieldAlt } from "react-icons/fa";

export default function VideoLobby() {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomName) {
      toast.error("Please enter a valid session ID");
      return;
    }

    setLoading(true);
    // Add prefix if not present for consistency
    const activeRoom = roomName.startsWith("consult-") ? roomName : `consult-${roomName}`;
    navigate(`/video/room/${activeRoom}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f18] text-white p-6">
      <div className="w-full max-w-lg">
        {/* Branding */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 mb-6">
            <FaShieldAlt className="text-3xl text-green-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Virtual Lobby</h1>
          <p className="text-gray-400 font-medium tracking-wide">Secure Video Consultation Hub</p>
        </div>

        {/* Manual Join Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div> Join Session
          </h2>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
                Room / Appointment ID
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                autoFocus
                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm font-bold focus:border-green-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-white/10"
                placeholder="Enter Room ID (e.g. consult-abc123)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1"
            >
              <FaVideo /> {loading ? "Connecting..." : "Join Video Call"}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-4 text-gray-500">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">
              ZEGO Cloud — Secure Video Calling
            </span>
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
          CureVirtual Secure Video Consultation
        </p>
      </div>
    </div>
  );
}
