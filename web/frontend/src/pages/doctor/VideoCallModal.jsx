import { useEffect, useState } from "react";
import ZegoVideoCall from "../../components/ZegoVideoCall";
import { FaSave } from "react-icons/fa";
import api from "../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VideoCallModal({ consultation, onClose }) {
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

  const userName = localStorage.getItem("userName") || "Doctor";
  const { id, roomName, meetingUrl, appointmentId } = consultation || {};
  const activeRoomName = meetingUrl || roomName || `consult-${id}`;
  const userId = localStorage.getItem("userId") || `d-${Math.random().toString(36).slice(2, 7)}`;

  useEffect(() => {
    const init = async () => {
      try {
        if (appointmentId) {
          const encRes = await api.get(`/clinical-encounter/${appointmentId}`);
          if (encRes.data) setEncounter((prev) => ({ ...prev, ...encRes.data }));
        }
      } catch {
        // Clinical encounter may not exist yet, that's ok
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [appointmentId]);

  const handleSave = async () => {
    try {
      await api.patch(`/clinical-encounter/${encounter.id || appointmentId}`, encounter);
      toast.success("Encounter saved.");
    } catch {
      toast.error("Save failed.");
    }
  };

  const handleEnd = async () => {
    await handleSave();
    onClose();
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black flex z-[200]">
      {/* Video Side — ZEGO */}
      <div className="flex-[2] relative bg-neutral-950">
        <ZegoVideoCall
          roomName={activeRoomName}
          userId={userId}
          userName={userName}
          onClose={handleEnd}
        />
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
