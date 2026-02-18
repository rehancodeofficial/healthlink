// FILE: src/pages/doctor/VideoCallModal.jsx
import { useEffect, useRef, useState } from "react";
import Video from "twilio-video";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaNotesMedical,
  FaFlask,
  FaExternalLinkAlt,
  FaSave,
  FaSignOutAlt,
} from "react-icons/fa";
import api from "../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VideoCallModal({ consultation, onClose }) {
  const [room, setRoom] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Connecting...");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const [showEndWarning, setShowEndWarning] = useState(false);
  
  // Clinical States
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
  const [saveLoading, setSaveLoading] = useState(false);

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const timerRef = useRef(null);
  const endTimeoutRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const { id, roomName, durationMins = 30, appointmentId } = consultation || {};

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    let activeRoom;

    const join = async () => {
      try {
        // Fetch clinical encounter
        if (appointmentId) {
            const encRes = await api.get(`/clinical-encounter/${appointmentId}`);
            if (encRes.data) setEncounter(prev => ({ ...prev, ...encRes.data }));
        }

        const identity = `${role?.toLowerCase() || "user"}-${userId}`;
        const activeRoomName = roomName || `consult_${id}`;

        const res = await api.post("/videocall/token", {
          identity,
          roomName: activeRoomName,
        });
        const { token } = res.data;
        if (!token) throw new Error("Missing token");

        const localTracks = await Video.createLocalTracks({
          audio: true,
          video: { width: 640 },
        });

        const localTrack = localTracks.find((t) => t.kind === "video");
        if (localRef.current && localTrack) {
          localRef.current.innerHTML = "";
          const el = localTrack.attach();
          el.style.transform = "scaleX(-1)";
          el.style.borderRadius = "12px";
          el.style.objectFit = "cover";
          localRef.current.appendChild(el);
        }

        activeRoom = await Video.connect(token, {
          name: activeRoomName,
          tracks: localTracks,
        });
        setRoom(activeRoom);
        setStatusMsg("Connected — waiting for Patient...");

        activeRoom.participants.forEach((p) => attachParticipant(p));
        activeRoom.on("participantConnected", attachParticipant);
        activeRoom.on("participantDisconnected", detachParticipant);
        activeRoom.on("dominantSpeakerChanged", (participant) => {
          setActiveSpeaker(participant?.identity || null);
        });

        startTimer();

        const endMs = durationMins * 60 * 1000;
        endTimeoutRef.current = setTimeout(() => {
          setShowEndWarning(true);
          setTimeout(() => endCall(true), 60000);
        }, endMs - 60000);
      } catch (err) {
        console.error("❌ join error:", err);
        setErrorMsg("Video connection failed.");
      }
    };

    const attachParticipant = (participant) => {
      if (participant.identity === `${role?.toLowerCase() || "user"}-${userId}`) return;
      participant.tracks.forEach((pub) => {
        if (pub.isSubscribed && pub.track.kind === "video") renderRemote(pub.track);
      });
      participant.on("trackSubscribed", (track) => {
        if (track.kind === "video") renderRemote(track);
      });
    };

    const renderRemote = (track) => {
      const el = track.attach();
      el.style.borderRadius = "12px";
      el.style.transform = "scaleX(1)";
      el.style.objectFit = "cover";
      if (remoteRef.current) {
        remoteRef.current.innerHTML = "";
        remoteRef.current.appendChild(el);
      }
    };

    const detachParticipant = () => {
      if (remoteRef.current) remoteRef.current.innerHTML = "";
    };

    const startTimer = () => {
      setCallTime(0);
      timerRef.current = setInterval(() => {
        setCallTime((t) => t + 1);
      }, 1000);
    };

    join();

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(endTimeoutRef.current);
      if (activeRoom) {
        activeRoom.localParticipant.tracks.forEach((pub) => pub.track.stop());
        activeRoom.disconnect();
      }
    };
  }, [id, roomName, role, userId, durationMins, appointmentId]);

  const toggleMute = () => {
    if (!room) return;
    room.localParticipant.audioTracks.forEach((pub) => {
      pub.track.isEnabled = !pub.track.isEnabled;
      setMuted(!pub.track.isEnabled);
    });
  };

  const toggleCamera = () => {
    if (!room) return;
    room.localParticipant.videoTracks.forEach((pub) => {
      pub.track.isEnabled = !pub.track.isEnabled;
      setCameraOff(!pub.track.isEnabled);
    });
  };

  const handleSaveEncounter = async () => {
    if (!encounter.id) return;
    setSaveLoading(true);
    try {
        await api.patch(`/clinical-encounter/${encounter.id}`, encounter);
    } catch (err) {
        console.error("Save error:", err);
    } finally {
        setSaveLoading(false);
    }
  };

  const endCall = async (auto = false) => {
    try {
      await handleSaveEncounter();
      clearInterval(timerRef.current);
      clearTimeout(endTimeoutRef.current);
      if (room) {
        room.localParticipant.tracks.forEach((pub) => pub.track.stop());
        room.disconnect();
      }
      await api.put(`/videocall/status/${id}`, { status: "COMPLETED" });
      if (auto) toast.info("⏰ Consultation time ended automatically.");
    } catch (e) {
      console.error(e);
    } finally {
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex justify-center items-center z-[60]">
      <div className="bg-[var(--bg-card)] rounded-[2rem] w-[95%] h-[92vh] flex flex-col overflow-hidden relative border border-[var(--border)] shadow-2xl">
        
        {/* Header Bar */}
        <div className="h-16 flex items-center justify-between px-8 bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
                 <img src="/images/logo/Asset3.png" alt="Logo" className="h-8" />
                 <div className="h-4 w-px bg-[var(--border)]"></div>
                 <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">
                    Clinical Room • {consultation?.patient?.user?.firstName} {consultation?.patient?.user?.lastName}
                 </h2>
            </div>
            
            <div className="flex items-center gap-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-green)] flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[var(--brand-green)] animate-pulse"></div>
                    {statusMsg}
                </span>
                <span className="font-mono text-xs bg-black/20 px-3 py-1 rounded-lg text-white">
                    {formatTime(callTime)}
                </span>
                <button onClick={onClose} className="text-[var(--text-soft)] hover:text-red-500 transition-colors">
                    <FaSignOutAlt />
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Left Column: Video Feeds */}
            <div className="flex-[1.2] flex flex-col p-4 gap-4 bg-black/40">
                <div ref={remoteRef} className="flex-1 rounded-3xl bg-neutral-900 border border-white/5 relative overflow-hidden flex items-center justify-center">
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/20">Waiting for Patient...</p>
                </div>
                <div className="h-48 flex gap-4">
                    <div ref={localRef} className="w-1/3 rounded-2xl bg-neutral-800 border border-white/5 relative overflow-hidden"></div>
                    <div className="flex-1 rounded-2xl bg-neutral-800/50 border border-white/5 p-4 flex flex-col justify-center">
                         <div className="flex justify-center gap-4">
                            <button onClick={toggleMute} className={`p-4 rounded-full ${muted ? "bg-red-500" : "bg-white/10 text-white"} hover:scale-110 transition shadow-lg`}>
                                {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                            </button>
                            <button onClick={toggleCamera} className={`p-4 rounded-full ${cameraOff ? "bg-red-500" : "bg-white/10 text-white"} hover:scale-110 transition shadow-lg`}>
                                {cameraOff ? <FaVideoSlash /> : <FaVideo />}
                            </button>
                            <button onClick={() => endCall(false)} className="p-4 rounded-full bg-red-600 text-white hover:scale-110 transition shadow-lg">
                                <FaPhoneSlash />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Clinical EHR */}
            <div className="flex-1 border-l border-[var(--border)] flex flex-col bg-[var(--bg-card)]">
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Vitals Section */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-soft)] mb-4 flex items-center gap-2">
                             <div className="h-1 w-1 rounded-full bg-[var(--brand-green)]"></div>
                             Patient Vitals
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            <VitalInput label="BP Sys" value={encounter.systolic} onChange={v => setEncounter({...encounter, systolic: v})} />
                            <VitalInput label="BP Dia" value={encounter.diastolic} onChange={v => setEncounter({...encounter, diastolic: v})} />
                            <VitalInput label="Pulse" value={encounter.pulse} onChange={v => setEncounter({...encounter, pulse: v})} />
                            <VitalInput label="Temp" value={encounter.temperature} onChange={v => setEncounter({...encounter, temperature: v})} />
                            <VitalInput label="Weight" value={encounter.weight} onChange={v => setEncounter({...encounter, weight: v})} />
                            <VitalInput label="O2 Sat" value={encounter.oxygenSat} onChange={v => setEncounter({...encounter, oxygenSat: v})} />
                        </div>
                    </div>

                    {/* SOAP Notes */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-soft)] mb-4 flex items-center gap-2">
                             <div className="h-1 w-1 rounded-full bg-[var(--brand-blue)]"></div>
                             Clinical Documentation (SOAP)
                        </h4>
                        <ClinicalTextarea label="Subjective" value={encounter.subjective} onChange={v => setEncounter({...encounter, subjective: v})} placeholder="Patient's reports, symptoms, history..." />
                        <ClinicalTextarea label="Objective" value={encounter.objective} onChange={v => setEncounter({...encounter, objective: v})} placeholder="Clinical observations, findings..." />
                        <ClinicalTextarea label="Assessment" value={encounter.assessment} onChange={v => setEncounter({...encounter, assessment: v})} placeholder="Diagnosis, potential conditions..." />
                        <ClinicalTextarea label="Plan" value={encounter.plan} onChange={v => setEncounter({...encounter, plan: v})} placeholder="Treatments, prescriptions, referrals..." />
                    </div>

                    {/* Quick Tools */}
                    <div className="pt-4 grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">
                            <FaFlask className="text-[var(--brand-blue)]" /> Order Lab
                        </button>
                        <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--border)] transition-colors border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">
                            <FaExternalLinkAlt className="text-[var(--brand-orange)]" /> Create Referral
                        </button>
                    </div>
                </div>

                {/* Bottom Save Bar */}
                <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-main)]/30">
                    <button 
                        onClick={handleSaveEncounter}
                        disabled={saveLoading}
                        className="w-full h-14 rounded-2xl bg-[var(--brand-green)] text-white text-xs font-black uppercase tracking-widest shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3"
                    >
                        {saveLoading ? "Saving..." : <><FaSave /> Save Clinical Note</>}
                    </button>
                    <p className="text-[9px] text-center mt-3 font-bold text-[var(--text-soft)] uppercase tracking-widest">
                        Drafts are auto-saved upon ending session
                    </p>
                </div>
            </div>
        </div>

        {errorMsg && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl z-[70] text-[10px] font-black uppercase tracking-widest">
            {errorMsg}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function VitalInput({ label, value, onChange }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-soft)] ml-1">{label}</label>
            <input 
                type="text" 
                value={value || ""} 
                onChange={e => onChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] text-xs font-bold text-[var(--text-main)] focus:border-[var(--brand-green)] outline-none transition-colors shadow-inner"
            />
        </div>
    );
}

function ClinicalTextarea({ label, value, onChange, placeholder }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-soft)] ml-1 flex items-center gap-2">
                <FaNotesMedical className="text-white/10" /> {label}
            </label>
            <textarea 
                value={value || ""} 
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full min-h-[100px] p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-xs font-bold text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none transition-colors shadow-inner scrollbar-hide"
            />
        </div>
    );
}
