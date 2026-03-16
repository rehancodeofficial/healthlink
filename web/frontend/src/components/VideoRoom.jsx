import React, { useEffect, useRef, useState } from "react";
import { useVideoSession } from "../hooks/useVideoSession";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaSignal,
  FaUser,
} from "react-icons/fa";

const VideoRoom = ({
  token,
  roomName,
  appointmentId,
  isDoctor,
  patientId,
  doctorName,
  onDisconnect,
}) => {
  const { isConnected, error, startSession, endSession, disconnect, localStream, remoteStream } =
    useVideoSession({
      token,
      roomName,
      appointmentId,
      isDoctor,
    });

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Attach Local Stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach Remote Stream
  useEffect(() => {
    // remoteStream is a MediaStream object that tracks are added to
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleEndCall = () => {
    if (isDoctor) {
      if (window.confirm("Terminate session for all participants?")) {
        endSession();
      }
    } else {
      disconnect();
    }
    onDisconnect && onDisconnect();
  };

  // Auto-start session for doctor when connected
  useEffect(() => {
    if (isDoctor && isConnected && doctorName) {
      startSession(doctorName, patientId);
    }
  }, [isConnected, isDoctor, doctorName, patientId, startSession]);

  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-8">
        <div className="glass p-8 rounded-3xl border border-red-500/20 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaPhoneSlash className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-2">
            Connection Error
          </h2>
          <p className="text-white/60 text-sm mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px]"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-[#0a0a0a] overflow-hidden font-sans text-white">
      {/* Remote Video (Full Screen) */}
      <div className="absolute inset-0 z-0">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        {!isConnected && (
          <div className="absolute inset-0 bg-neutral-900/80 flex flex-col items-center justify-center space-y-4 backdrop-blur-md">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
              <FaUser className="text-white/20 text-3xl" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 animate-pulse">
              Connecting...
            </p>
          </div>
        )}
      </div>

      {/* Top Overlay Info */}
      <div className="absolute top-8 left-8 z-20 flex flex-col gap-3">
        <div className="glass py-2 px-4 rounded-2xl flex items-center gap-4 border border-white/10 shadow-2xl">
          <img src="/images/logo/Asset3.png" alt="CureVirtual" className="h-4" />
          <div className="h-4 w-px bg-white/20"></div>
          <div>
            <h2 className="text-[9px] font-black uppercase tracking-widest text-white/80">
              Secure Live Link
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[7px] font-bold text-white/40 uppercase">Encrypted 4K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Local Video (Floating PiP) */}
      <div className="absolute top-8 right-8 w-48 aspect-video rounded-3xl bg-black border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 overflow-hidden hover:scale-105 transition-all duration-500 cursor-move">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
        {isVideoOff && (
          <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
            <FaVideoSlash className="text-white/20 text-xl" />
          </div>
        )}
      </div>

      {/* Bottom Controls (Premium Skype/FaceTime Style) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/25"}`}
          >
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>

          <button
            onClick={handleEndCall}
            className="w-16 h-12 bg-red-600 hover:bg-red-700 text-white rounded-[1.5rem] flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-red-500/30"
          >
            <FaPhoneSlash className="text-xl" />
          </button>

          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/25"}`}
          >
            {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;
