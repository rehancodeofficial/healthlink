import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/useSocket";
import { FaVideo, FaPhoneSlash, FaPhone } from "react-icons/fa";

export default function IncomingCallModal() {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [callData, setCallData] = useState(null); // { consultationId, doctorName, roomName }
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!socket) return;

    const onIncomingCall = (data) => {
      console.log("🔔 Incoming call received:", data);
      setCallData(data);
      setCountdown(60);

      // Attempt to play a subtle ringtone if needed
      // const audio = new Audio('/sounds/ringtone.mp3');
      // audio.play();
      // ringtoneRef.current = audio;
    };

    const onCallMissed = ({ consultationId }) => {
      if (callData?.consultationId === consultationId) {
        setCallData(null);
        // stopRingtone();
      }
    };

    socket.on("incoming-call", onIncomingCall);
    socket.on("call-missed", onCallMissed);

    return () => {
      socket.off("incoming-call", onIncomingCall);
      socket.off("call-missed", onCallMissed);
    };
  }, [socket, callData]);

  // Countdown for visual UI
  useEffect(() => {
    let timer;
    if (callData && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setCallData(null);
    }
    return () => clearInterval(timer);
  }, [callData, countdown]);

  const handleAccept = () => {
    if (!socket || !callData) return;

    socket.emit("accept-video-call", {
      consultationId: callData.consultationId,
      doctorUserId: callData.doctorUserId,
    });

    const roomId = callData.roomName || `consult_${callData.consultationId}`;
    setCallData(null);
    navigate(`/video/room/${roomId}`);
  };

  const handleReject = () => {
    if (!socket || !callData) return;

    socket.emit("reject-video-call", {
      consultationId: callData.consultationId,
      doctorUserId: callData.doctorUserId,
    });

    setCallData(null);
  };

  if (!callData) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] animate-in fade-in duration-500">
      <div className="bg-[#1a1c1e] w-full max-w-sm rounded-[3rem] p-8 border border-white/10 shadow-2xl flex flex-col items-center text-center">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-green-500/10 flex items-center justify-center animate-pulse">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-ping absolute"></div>
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)]">
              <FaVideo className="text-white text-3xl" />
            </div>
          </div>
        </div>

        <h3 className="text-[var(--brand-green)] text-[10px] font-black uppercase tracking-[0.4em] mb-2">
          Incoming Consultation
        </h3>
        <h2 className="text-white text-3xl font-black uppercase tracking-tighter mb-1">
          {callData.doctorName}
        </h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
          Waiting for your response — {countdown}s
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex gap-4 w-full">
          <button
            onClick={handleReject}
            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border border-red-500/20"
          >
            <FaPhoneSlash /> Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 bg-green-500 hover:bg-green-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
          >
            <FaPhone /> Accept
          </button>
        </div>
      </div>
    </div>
  );
}
