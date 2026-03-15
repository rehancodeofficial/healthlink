import { useEffect, useState, useCallback } from "react";
import { useVideoSession } from "../../hooks/useVideoSession";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaNotesMedical,
  FaFlask,
  FaSave,
} from "react-icons/fa";
import api from "../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VideoCallModal({ consultation, onClose }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [encounter, setEncounter] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    systolic: "",
    diastolic: "",
    pulse: "",
    temperature: "",
    weight: "",
    oxygenSat: "",
  });

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Doctor";
  const { id, roomName, appointmentId } = consultation || {};
  const activeRoomName = roomName || `consult_${id}`;

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.post("/videocall/token", {
          identity: `doctor-${userId}`,
          roomName: activeRoomName,
        });
        setToken(res.data.token);

        if (appointmentId) {
          const encRes = await api.get(`/clinical-encounter/${appointmentId}`);
          if (encRes.data) setEncounter((prev) => ({ ...prev, ...encRes.data }));
        }
      } catch (err) {
        toast.error("Failed to initialize session.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, activeRoomName, userId, appointmentId]);

  const { room, isConnected, startSession, endSession, disconnect } = useVideoSession({
    token,
    roomName: activeRoomName,
    appointmentId: id,
    isDoctor: true,
  });

  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [callTime, setCallTime] = useState(0);

  useEffect(() => {
    let timer;
    if (isConnected) {
      timer = setInterval(() => setCallTime((t) => t + 1), 1000);
      startSession(userName, consultation?.patient?.userId);
    }
    return () => clearInterval(timer);
  }, [isConnected, startSession, userName, consultation?.patient?.userId]);

  const handleSave = async () => {
    try {
      await api.patch(`/clinical-encounter/${encounter.id || appointmentId}`, encounter);
      toast.success("Encounter saved.");
    } catch (e) {
      toast.error("Save failed.");
    }
  };

  const handleEnd = async () => {
    await handleSave();
    endSession();
    onClose();
  };

  const toggleMute = () => {
    if (room) {
      room.localParticipant.audioTracks.forEach((pub) => {
        if (muted) pub.track.enable();
        else pub.track.disable();
      });
      setMuted(!muted);
    }
  };

  const toggleCamera = () => {
    if (room) {
      room.localParticipant.videoTracks.forEach((pub) => {
        if (cameraOff) pub.track.enable();
        else pub.track.disable();
      });
      setCameraOff(!cameraOff);
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black flex z-[200]">
      {/* Video Side */}
      <div className="flex-[2] relative bg-neutral-950 flex items-center justify-center">
        <p className="text-white/20 uppercase tracking-widest text-xs">
          {isConnected ? "Live Session" : "Connecting..."}
        </p>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/10 backdrop-blur-3xl px-8 py-4 rounded-full border border-white/20 z-50">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full ${muted ? "bg-red-500" : "bg-white/10"}`}
          >
            {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <button
            onClick={handleEnd}
            className="p-4 bg-red-600 rounded-full hover:scale-110 transition"
          >
            <FaPhoneSlash />
          </button>
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full ${cameraOff ? "bg-red-500" : "bg-white/10"}`}
          >
            {cameraOff ? <FaVideoSlash /> : <FaVideo />}
          </button>
        </div>
      </div>

      {/* Clinical Notes Side */}
      <div className="w-96 bg-gray-900 border-l border-white/10 flex flex-col p-6 space-y-6 overflow-y-auto">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-green-500">
          Clinical EHR
        </h3>

        <textarea
          value={encounter.subjective}
          onChange={(e) => setEncounter({ ...encounter, subjective: e.target.value })}
          placeholder="Subjective..."
          className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-green-500"
        />
        <textarea
          value={encounter.plan}
          onChange={(e) => setEncounter({ ...encounter, plan: e.target.value })}
          placeholder="Plan..."
          className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-green-500"
        />

        <button
          onClick={handleSave}
          className="w-full py-4 bg-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <FaSave /> Save Encounter
        </button>
      </div>

      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
}
