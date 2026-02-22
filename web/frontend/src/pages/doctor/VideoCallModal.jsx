// FILE: src/pages/doctor/VideoCallModal.jsx
import { useEffect, useRef, useState, useCallback } from "react";
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

  const [networkQuality, setNetworkQuality] = useState(5);
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // connecting, connected, reconnecting, disconnected

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
        setConnectionStatus("connecting");
        // Fetch clinical encounter
        if (appointmentId) {
          const encRes = await api.get(`/clinical-encounter/${appointmentId}`);
          if (encRes.data) setEncounter((prev) => ({ ...prev, ...encRes.data }));
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
          video: { width: 1280, height: 720, frameRate: 24 },
        });

        const localTrack = localTracks.find((t) => t.kind === "video");
        if (localRef.current && localTrack) {
          localRef.current.innerHTML = "";
          const el = localTrack.attach();
          el.style.transform = "scaleX(-1)";
          el.style.borderRadius = "12px";
          el.style.objectFit = "cover";
          el.style.width = "100%";
          el.style.height = "100%";
          localRef.current.appendChild(el);
        }

        activeRoom = await Video.connect(token, {
          name: activeRoomName,
          tracks: localTracks,
          networkQuality: { local: 1, remote: 1 },
        });

        setRoom(activeRoom);
        setConnectionStatus("connected");
        setStatusMsg("Connected — waiting for Patient...");

        // Update status to ONGOING in backend
        await api.put(`/videocall/status/${id}`, { status: "ONGOING" });

        activeRoom.participants.forEach((p) => attachParticipant(p));
        activeRoom.on("participantConnected", attachParticipant);
        activeRoom.on("participantDisconnected", detachParticipant);

        activeRoom.on("reconnecting", (error) => {
          if (error.code === 53001) {
            console.log("Reconnecting to room...");
            setConnectionStatus("reconnecting");
            setStatusMsg("Reconnecting...");
          }
        });

        activeRoom.on("reconnected", () => {
          console.log("Reconnected to room!");
          setConnectionStatus("connected");
          setStatusMsg("Reconnected!");
        });

        activeRoom.on("disconnected", (room, error) => {
          if (error) {
            console.log("Disconnected due to error:", error);
            setConnectionStatus("disconnected");
            setStatusMsg("Disconnected by error.");
          }
        });

        // Network Quality Level
        setNetworkQuality(activeRoom.localParticipant.networkQualityLevel);
        activeRoom.localParticipant.on("networkQualityLevelChanged", (level) => {
          setNetworkQuality(level);
        });

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
        setErrorMsg("Video connection failed. Check camera permissions.");
        setConnectionStatus("disconnected");
      }
    };

    const attachParticipant = (participant) => {
      console.log(`Participant "${participant.identity}" connected`);
      setStatusMsg(`Connected with ${participant.identity}`);

      participant.tracks.forEach((pub) => {
        if (pub.isSubscribed && pub.track.kind === "video") renderRemote(pub.track);
      });
      participant.on("trackSubscribed", (track) => {
        if (track.kind === "video") renderRemote(track);
      });
    };

    const renderRemote = (track) => {
      const el = track.attach();
      el.style.borderRadius = "0px";
      el.style.transform = "scaleX(1)";
      el.style.objectFit = "cover";
      el.style.width = "100%";
      el.style.height = "100%";
      if (remoteRef.current) {
        remoteRef.current.innerHTML = "";
        remoteRef.current.appendChild(el);
      }
    };

    const detachParticipant = (participant) => {
      console.log(`Participant "${participant.identity}" disconnected`);
      setStatusMsg("Patient left the room.");
      if (remoteRef.current) remoteRef.current.innerHTML = "";
    };

    const startTimer = () => {
      setCallTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
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
  }, [id, roomName, role, userId, durationMins, appointmentId, endCall]);

  const toggleMute = () => {
    if (!room) return;
    room.localParticipant.audioTracks.forEach((pub) => {
      if (pub.track.isEnabled) pub.track.disable();
      else pub.track.enable();
      setMuted(!pub.track.isEnabled);
    });
  };

  const toggleCamera = () => {
    if (!room) return;
    room.localParticipant.videoTracks.forEach((pub) => {
      if (pub.track.isEnabled) pub.track.disable();
      else pub.track.enable();
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

  /* eslint-disable react-hooks/exhaustive-deps */
  const endCall = useCallback(
    async (auto = false) => {
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
    },
    [room, id, encounter, onClose]
  );

  useEffect(() => {
    // Re-bind endCall timeout if it exists
    if (room && durationMins) {
      // logic already in the main join useEffect
    }
  }, [endCall]);

  const ConnectionIndicator = () => {
    const bars = [1, 2, 3, 4, 5];
    return (
      <div className="flex gap-0.5 items-end h-3">
        {bars.map((b) => (
          <div
            key={b}
            className={`w-1 rounded-sm ${
              b <= networkQuality
                ? networkQuality <= 2
                  ? "bg-red-500"
                  : networkQuality <= 3
                    ? "bg-yellow-500"
                    : "bg-green-500"
                : "bg-white/20"
            }`}
            style={{ height: `${(b / 5) * 100}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black flex justify-center items-center z-[60]">
      {/* Main Container */}
      <div className="w-full h-full flex flex-col md:flex-row overflow-hidden relative">
        {/* LEFT COLUMN: Video Area */}
        <div className="flex-[2] relative bg-neutral-950 flex items-center justify-center overflow-hidden">
          {/* Background Branding */}
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <img src="/images/logo/Asset3.png" alt="" className="w-64 grayscale" />
          </div>

          {/* Remote Video (Full Screen) */}
          <div ref={remoteRef} className="absolute inset-0 z-0">
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse flex items-center justify-center border border-white/10">
                <FaVideo className="text-white/20 text-3xl" />
              </div>
              <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 animate-pulse">
                {statusMsg}
              </p>
            </div>
          </div>

          {/* Local Video (PiP) */}
          <div
            ref={localRef}
            className="absolute top-8 right-8 w-48 aspect-video rounded-2xl bg-neutral-800 border-2 border-white/10 shadow-2xl z-20 overflow-hidden cursor-move hover:scale-105 transition-transform"
            title="Your Camera"
          >
            {cameraOff && (
              <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                <FaVideoSlash className="text-white/20 text-xl" />
              </div>
            )}
          </div>

          {/* Active Speaker / Overlay info */}
          <div className="absolute top-8 left-8 z-20 pointer-events-none space-y-2">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-4">
              <img src="/images/logo/Asset3.png" alt="Logo" className="h-5" />
              <div className="h-4 w-px bg-white/20"></div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-widest text-white">
                  {consultation?.patient?.user?.firstName} {consultation?.patient?.user?.lastName}
                </h2>
                <div className="flex items-center gap-2">
                  <ConnectionIndicator />
                  <span className="text-[8px] font-bold text-white/60 uppercase tracking-tighter">
                    {connectionStatus === "connected" ? "Secure HD" : connectionStatus}
                  </span>
                </div>
              </div>
            </div>

            {activeSpeaker && (
              <div className="bg-[var(--brand-green)] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block shadow-lg">
                Speaker: Active
              </div>
            )}
          </div>

          {/* Bottom Controls (Skype Style Floating) */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 group">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 px-8 py-5 rounded-[2.5rem] flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all group-hover:bg-white/15">
              {/* Call Duration */}
              <div className="text-center min-w-[60px]">
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">
                  Live
                </p>
                <p className="font-mono text-xs text-white font-bold">{formatTime(callTime)}</p>
              </div>

              <div className="w-px h-8 bg-white/10"></div>

              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${muted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/25"}`}
              >
                {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>

              <button
                onClick={toggleCamera}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${cameraOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/25"}`}
              >
                {cameraOff ? <FaVideoSlash /> : <FaVideo />}
              </button>

              <button
                onClick={() => endCall(false)}
                className="w-16 h-12 rounded-3xl bg-red-600 text-white flex items-center justify-center hover:bg-red-700 hover:scale-110 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              >
                <FaPhoneSlash className="text-xl" />
              </button>

              <div className="w-px h-8 bg-white/10"></div>

              {/* Quality Indicator Toggle (Placeholder for more settings) */}
              <div className="flex flex-col items-center gap-1 opacity-50">
                <FaFlask className="text-xs" />
                <span className="text-[7px] font-black uppercase tracking-tighter">HD</span>
              </div>
            </div>
          </div>

          {/* Status Notifications */}
          {showEndWarning && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-2xl z-[70] text-[10px] font-black uppercase tracking-widest animate-bounce">
              ⚠️ 1 Minute Remaining
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Clinical EHR (Preserved & Styled) */}
        <div className="flex-1 w-full md:w-auto h-[40vh] md:h-full border-t md:border-t-0 md:border-l border-[var(--border)] flex flex-col bg-[var(--bg-card)] z-40">
          <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg-main)]/30">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-main)]">
              Clinical Notes
            </h3>
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-[var(--brand-green)]"></div>
              <div className="h-2 w-2 rounded-full bg-[var(--brand-blue)]"></div>
              <div className="h-2 w-2 rounded-full bg-[var(--brand-orange)]"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide bg-gradient-to-b from-[var(--bg-main)]/20 to-transparent">
            {/* Vitals Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-soft)] mb-4 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)]"></div>
                Patient Vitals
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <VitalInput
                  label="BP Sys"
                  value={encounter.systolic}
                  onChange={(v) => setEncounter({ ...encounter, systolic: v })}
                />
                <VitalInput
                  label="BP Dia"
                  value={encounter.diastolic}
                  onChange={(v) => setEncounter({ ...encounter, diastolic: v })}
                />
                <VitalInput
                  label="Pulse"
                  value={encounter.pulse}
                  onChange={(v) => setEncounter({ ...encounter, pulse: v })}
                />
                <VitalInput
                  label="Temp"
                  value={encounter.temperature}
                  onChange={(v) => setEncounter({ ...encounter, temperature: v })}
                />
                <VitalInput
                  label="Weight"
                  value={encounter.weight}
                  onChange={(v) => setEncounter({ ...encounter, weight: v })}
                />
                <VitalInput
                  label="O2 Sat"
                  value={encounter.oxygenSat}
                  onChange={(v) => setEncounter({ ...encounter, oxygenSat: v })}
                />
              </div>
            </div>

            {/* SOAP Notes */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-soft)] mb-4 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--brand-blue)]"></div>
                Clinical Documentation (SOAP)
              </h4>
              <ClinicalTextarea
                label="Subjective"
                value={encounter.subjective}
                onChange={(v) => setEncounter({ ...encounter, subjective: v })}
                placeholder="Patient's reports, symptoms, history..."
              />
              <ClinicalTextarea
                label="Objective"
                value={encounter.objective}
                onChange={(v) => setEncounter({ ...encounter, objective: v })}
                placeholder="Clinical observations, findings..."
              />
              <ClinicalTextarea
                label="Assessment"
                value={encounter.assessment}
                onChange={(v) => setEncounter({ ...encounter, assessment: v })}
                placeholder="Diagnosis, potential conditions..."
              />
              <ClinicalTextarea
                label="Plan"
                value={encounter.plan}
                onChange={(v) => setEncounter({ ...encounter, plan: v })}
                placeholder="Treatments, prescriptions, referrals..."
              />
            </div>

            {/* Quick Tools */}
            <div className="pt-4 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 p-4 rounded-3xl bg-[var(--bg-main)] hover:bg-[var(--border)] transition-all border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--text-main)] shadow-sm hover:shadow-md">
                <FaFlask className="text-[var(--brand-blue)] text-sm" /> Order Lab
              </button>
              <button className="flex items-center justify-center gap-3 p-4 rounded-3xl bg-[var(--bg-main)] hover:bg-[var(--border)] transition-all border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--text-main)] shadow-sm hover:shadow-md">
                <FaExternalLinkAlt className="text-[var(--brand-orange)] text-sm" /> Create Referral
              </button>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-main)]/60 backdrop-blur-md">
            <button
              onClick={handleSaveEncounter}
              disabled={saveLoading}
              className="w-full h-14 rounded-[1.25rem] bg-[var(--brand-green)] text-white text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(var(--brand-green-rgb),0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {saveLoading ? (
                "Saving..."
              ) : (
                <>
                  <FaSave /> Save Clinical Note
                </>
              )}
            </button>
            <p className="text-[8px] text-center mt-3 font-bold text-[var(--text-soft)] uppercase tracking-widest opacity-60">
              Drafts are auto-saved upon ending session
            </p>
          </div>
        </div>

        {/* Global Error Popover */}
        {errorMsg && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-xl text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 border border-red-500/50 animate-in fade-in zoom-in duration-300">
            <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
            {errorMsg}
            <button
              onClick={() => setErrorMsg("")}
              className="ml-4 hover:opacity-50 transition-opacity"
            >
              ✖
            </button>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}

function VitalInput({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-soft)] ml-1 opacity-70">
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-xs font-bold text-[var(--text-main)] focus:border-[var(--brand-green)] focus:ring-1 focus:ring-[var(--brand-green)]/20 outline-none transition-all shadow-inner"
      />
    </div>
  );
}

function ClinicalTextarea({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-3">
      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-soft)] ml-1 flex items-center gap-2">
        <FaNotesMedical className="opacity-20" /> {label}
      </label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[120px] p-5 rounded-[1.5rem] bg-[var(--bg-main)] border border-[var(--border)] text-xs font-medium text-[var(--text-main)] focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)]/20 outline-none transition-all shadow-inner scrollbar-hide resize-none"
      />
    </div>
  );
}
