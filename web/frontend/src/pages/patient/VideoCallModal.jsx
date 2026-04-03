import { useEffect, useState } from "react";
import ZegoVideoCall from "../../components/ZegoVideoCall";
import { FaClock } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VideoCallModal({ consultation, onClose }) {
  const userName = localStorage.getItem("userName") || "Patient";
  const { id, roomName, meetingUrl } = consultation || {};
  const activeRoomName = meetingUrl || roomName || `consult-${id}`;
  const userId = localStorage.getItem("userId") || `u-${Math.random().toString(36).slice(2, 7)}`;

  const [callTime, setCallTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let timer;
    if (isConnected) {
      timer = setInterval(() => setCallTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isConnected]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex justify-center items-center z-[200]">
      <div className="w-full h-full flex flex-col relative overflow-hidden">
        {/* ZEGO Video Call */}
        <ZegoVideoCall
          roomName={activeRoomName}
          userId={userId}
          userName={userName}
          onClose={onClose}
        />

        {/* Call Timer Overlay */}
        {isConnected && (
          <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20">
            <span className="text-white font-mono text-sm flex items-center gap-2">
              <FaClock className="text-green-400" /> {formatTime(callTime)}
            </span>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
}
