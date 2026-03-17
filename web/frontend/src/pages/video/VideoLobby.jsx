import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { toast } from "react-toastify";
import { FaVideo, FaUserMd, FaShieldAlt } from "react-icons/fa";

export default function VideoLobby() {
  const [identity, setIdentity] = useState(
    localStorage.getItem("userName") || localStorage.getItem("name") || ""
  );
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionNotification, setSessionNotification] = useState(null);
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleSessionStarted = ({ doctorName, roomId, appointmentId }) => {
      console.log("🔔 Session started notification:", { doctorName, roomId, appointmentId });
      setSessionNotification({ doctorName, roomId, appointmentId });
      toast.info(`Dr. ${doctorName} is ready for your consultation!`, {
        autoClose: 10000,
        position: "top-center",
      });
    };

    socket.on("session_started", handleSessionStarted);

    return () => {
      socket.off("session_started", handleSessionStarted);
    };
  }, [socket]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomName) {
      toast.error("Please enter a valid session ID");
      return;
    }

    if (!isConnected) {
      toast.error("Connection lost. Retrying...");
      return;
    }

    setLoading(true);
    // Add prefix if not present for consistency
    const activeRoom = roomName.startsWith("consult_") ? roomName : `consult_${roomName}`;
    navigate(`/video/room/${activeRoom}`);
  };

  const handleJoinNotification = () => {
    if (!sessionNotification) return;
    navigate(`/video/room/${sessionNotification.roomId}`);
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
          <p className="text-gray-400 font-medium tracking-wide">
            Secure HIPAA-Compliant Video Hub
          </p>
        </div>

        {/* Dynamic Notification */}
        {sessionNotification && (
          <div className="mb-10 bg-gradient-to-br from-green-600 to-green-700 p-8 rounded-[2rem] shadow-2xl shadow-green-500/20 animate-in zoom-in-95 duration-500">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl">
                <FaUserMd className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Doctor is Ready!</h3>
                <p className="text-white/80 text-sm">
                  Dr. {sessionNotification.doctorName} is waiting in the secure room.
                </p>
              </div>
            </div>
            <button
              onClick={handleJoinNotification}
              className="w-full py-5 bg-white text-green-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              Enter Secured Session
            </button>
          </div>
        )}

        {/* Manual Join Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div> Manual Entry
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
                placeholder="Enter ID (e.g. 123)"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isConnected}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1"
            >
              <FaVideo /> {loading ? "Authorizing..." : "Initialize Link"}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-4 text-gray-500">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500 animate-ping"}`}
            ></div>
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isConnected ? "Server Link Active" : "Searching for Uplink..."}
            </span>
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
          CureVirtual Secure Encryption Active
        </p>
      </div>
    </div>
  );
}
