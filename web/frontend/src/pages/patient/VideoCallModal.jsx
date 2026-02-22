// FILE: src/pages/patient/VideoCallModal.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import Video from "twilio-video";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaClock,
  FaFlask,
} from "react-icons/fa";
import api from "../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VideoCallModal({ consultation, onClose }) {
  const [room, setRoom] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Establishing Secure Uplink...");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const [showEndWarning, setShowEndWarning] = useState(false);
  const [networkQuality, setNetworkQuality] = useState(5);
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // connecting, connected, reconnecting, disconnected

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const timerRef = useRef(null);
  const endTimeoutRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const role = "PATIENT";
  const { id, roomName, durationMins = 30 } = consultation || {};

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return h !== "00" ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  const endCall = useCallback(
    async (auto = false) => {
      try {
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
    [room, id, onClose]
  );

  useEffect(() => {
    let activeRoom;

    const join = async () => {
      try {
        setConnectionStatus("connecting");
        const identity = `${role.toLowerCase()}-${userId}`;
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
        setStatusMsg("Connected — wait for your Specialist...");

        activeRoom.participants.forEach((p) => attachParticipant(p));
        activeRoom.on("participantConnected", attachParticipant);
        activeRoom.on("participantDisconnected", detachParticipant);

        activeRoom.on("reconnecting", (error) => {
          if (error.code === 53001) {
            setConnectionStatus("reconnecting");
            setStatusMsg("Re-establishing link...");
          }
        });

        activeRoom.on("reconnected", () => {
          setConnectionStatus("connected");
          setStatusMsg("Link Restored.");
        });

        activeRoom.on("disconnected", (room, error) => {
          if (error) {
            setConnectionStatus("disconnected");
            setStatusMsg("Neural link severed.");
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
        setErrorMsg("Uplink failed. Check camera permissions.");
        setConnectionStatus("disconnected");
      }
    };

    const attachParticipant = (participant) => {
      console.log(`Specialist connected: ${participant.identity}`);
      setStatusMsg("Specialist Onsite — Protocol Active.");

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
      console.log(`Specialist disconnected: ${participant.identity}`);
      setStatusMsg("Specialist left the room.");
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
  }, [id, roomName, userId, durationMins, endCall]);

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
    <div className="fixed inset-0 bg-black flex justify-center items-center z-[200]">
      {/* Background Branding */}
      <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
        <img src="/images/logo/Asset3.png" alt="" className="w-96 grayscale" />
      </div>

      {/* Main Container */}
      <div className="w-full h-full flex flex-col relative overflow-hidden">
        {/* Remote Video (Full Screen) */}
        <div ref={remoteRef} className="absolute inset-0 z-0">
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-white/5 animate-pulse flex items-center justify-center border border-white/10">
              <FaVideo className="text-white/20 text-4xl" />
            </div>
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/30 animate-pulse">
              {statusMsg}
            </p>
          </div>
        </div>

        {/* Local Video (PiP) */}
        <div
          ref={localRef}
          className="absolute top-12 right-12 w-48 md:w-64 aspect-video rounded-3xl bg-neutral-800 border-2 border-white/10 shadow-2xl z-20 overflow-hidden cursor-move hover:scale-105 transition-transform"
          title="Your Camera"
        >
          {cameraOff && (
            <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
              <FaVideoSlash className="text-white/20 text-2xl" />
            </div>
          )}
        </div>

        {/* Overlay Navigation Info */}
        <div className="absolute top-12 left-12 z-20 pointer-events-none space-y-3">
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-3xl flex items-center gap-6">
            <img src="/images/logo/Asset3.png" alt="Logo" className="h-6" />
            <div className="h-6 w-px bg-white/20"></div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-white shadow-sm">
                Clinical Consultation Room
              </h2>
              <div className="flex items-center gap-3 mt-0.5">
                <ConnectionIndicator />
                <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">
                  {connectionStatus === "connected" ? "Secure Encrypted Link" : connectionStatus}
                </span>
              </div>
            </div>
          </div>

          {activeSpeaker && (
            <div className="bg-[var(--brand-green)] text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full inline-block shadow-xl border border-white/10">
              Live Session Active
            </div>
          )}
        </div>

        {/* Status Notifications */}
        {showEndWarning && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-8 py-3 rounded-2xl shadow-2xl z-[70] text-[10px] font-black uppercase tracking-widest animate-bounce border border-white/20">
            ⚠️ Session Concludes in 1 Minute
          </div>
        )}

        {/* Floating Controls Overlay (Skype Style) */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 group">
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 px-10 py-6 rounded-[3rem] flex items-center gap-10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all hover:bg-white/15 hover:border-white/30">
            {/* Call Duration */}
            <div className="text-center min-w-[70px]">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">
                Duration
              </p>
              <p className="font-mono text-sm text-white font-bold">{formatTime(callTime)}</p>
            </div>

            <div className="w-px h-10 bg-white/10"></div>

            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${muted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/25"}`}
            >
              {muted ? <FaMicrophoneSlash size={22} /> : <FaMicrophone size={22} />}
            </button>

            <button
              onClick={() => endCall(false)}
              className="w-20 h-14 rounded-[2.5rem] bg-red-600 text-white flex items-center justify-center hover:bg-red-700 hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] border border-white/10"
            >
              <FaPhoneSlash className="text-2xl" />
            </button>

            <button
              onClick={toggleCamera}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${cameraOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/25"}`}
            >
              {cameraOff ? <FaVideoSlash size={22} /> : <FaVideo size={22} />}
            </button>

            <div className="w-px h-10 bg-white/10"></div>

            {/* Info / Tool (Placeholder) */}
            <div className="flex flex-col items-center gap-1.5 opacity-40 cursor-help transition-opacity hover:opacity-100">
              <FaFlask className="text-sm text-white" />
              <span className="text-[8px] font-bold uppercase tracking-tighter text-white">
                4K Link
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Popover */}
        {errorMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-2xl text-white px-10 py-5 rounded-2xl shadow-2xl z-[300] text-xs font-black uppercase tracking-widest flex items-center gap-5 border border-red-500/50 animate-in fade-in slide-in-from-top-4">
            <div className="w-3 h-3 rounded-full bg-white animate-ping"></div>
            {errorMsg}
            <button
              onClick={() => setErrorMsg("")}
              className="ml-6 hover:opacity-50 transition-opacity"
            >
              ✖
            </button>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" hideProgressBar />
    </div>
  );
}
