// FILE: src/components/VideoCallModal.jsx
import { useEffect, useRef, useState } from "react";
import Video from "twilio-video";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
} from "react-icons/fa";
import api from "../../Lib/api";

export default function VideoCallModal({ consultation, onClose }) {
  const [room, setRoom] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Connecting...");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const [showEndWarning, setShowEndWarning] = useState(false);

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const timerRef = useRef(null);
  const endTimeoutRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const { id, roomName, durationMins = 30 } = consultation || {};

  // Format hh:mm:ss
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
        const identity = `${role?.toLowerCase() || "user"}-${userId}`;
        const activeRoomName = roomName || `consult_${id}`;
        console.log("🎥 Joining room:", { identity, activeRoomName });

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

        // attach local video (mirror)
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
        setStatusMsg("Curevirtual");
        setStatusMsg("Connected — waiting for Patient...");

        // attach remote
        activeRoom.participants.forEach((p) => attachParticipant(p));
        activeRoom.on("participantConnected", attachParticipant);
        activeRoom.on("participantDisconnected", detachParticipant);
        activeRoom.on("dominantSpeakerChanged", (participant) => {
          setActiveSpeaker(participant?.identity || null);
        });

        // Start timer
        startTimer();

        // Auto-end setup
        const endMs = durationMins * 60 * 1000;
        endTimeoutRef.current = setTimeout(() => {
          setShowEndWarning(true);
          setTimeout(() => endCall(true), 60000); // end 1 min later
        }, endMs - 60000);
      } catch (err) {
        console.error("❌ join error:", err);
        setErrorMsg("Video connection failed.");
      }
    };

    const attachParticipant = (participant) => {
      console.log("👥 Participant connected:", participant.identity);

      if (participant.identity === `${role?.toLowerCase() || "user"}-${userId}`)
        return;

      participant.tracks.forEach((pub) => {
        if (pub.isSubscribed && pub.track.kind === "video") {
          renderRemote(pub.track);
        }
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
      if (localRef.current) localRef.current.innerHTML = "";
      if (remoteRef.current) remoteRef.current.innerHTML = "";
    };
  }, [id, roomName, role, userId, durationMins]);

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

  const endCall = async (auto = false) => {
    try {
      clearInterval(timerRef.current);
      clearTimeout(endTimeoutRef.current);
      if (room) {
        room.localParticipant.tracks.forEach((pub) => pub.track.stop());
        room.disconnect();
      }
      await api.put(`/videocall/status/${id}`, { status: "COMPLETED" });
      if (auto) alert("⏰ Consultation time ended automatically.");
    } catch (e) {
      console.error(e);
    } finally {
      onClose?.();
    }
  };

  const isActiveDoctor =
    activeSpeaker === `${role?.toLowerCase() || "user"}-${userId}`;

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50">
      <div className="bg-[var(--bg-card)] rounded-2xl w-11/12 md:w-4/5 lg:w-3/5 h-[80vh] flex flex-col overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-[var(--text-soft)] text-xl z-20"
        >
          ✖
        </button>

        {/* Status + Timer */}
        <div className="text-center text-sm bg-blue-600/80 text-[var(--text-main)] py-2 flex justify-center gap-4">
                        <img
                    src="/images/logo/Asset2.png"
                    alt="CureVirtual"
                    style={{ width: 80, height: "auto" }}
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_LOGO; }} // fallback if missing
                  />
          <span>{statusMsg}</span>
          {room && (
            <span className="font-mono bg-black/40 px-3 py-1 rounded">
              ⏱ {formatTime(callTime)}
            </span>
          )}
        </div>

        {errorMsg && (
          <div className="text-center text-sm bg-red-600/80 text-[var(--text-main)] py-2">
            {errorMsg}
          </div>
        )}
        {showEndWarning && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-6 py-2 rounded-full shadow-lg z-30 animate-pulse text-sm">
            ⚠️ 1 minute left before auto-end
          </div>
        )}

        {/* Video Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-3 relative transition-all">
          <div
            ref={localRef}
            className={`rounded-lg flex items-center justify-center overflow-hidden transition-all duration-500 ${
              isActiveDoctor ? "order-2 scale-110 z-10" : "order-1 opacity-90"
            }`}
            style={{ backgroundColor: "#222" }}
          >
            <p className="text-[var(--text-muted)]">Local video</p>
          </div>

          <div
            ref={remoteRef}
            className={`rounded-lg flex items-center justify-center overflow-hidden transition-all duration-500 ${
              !isActiveDoctor ? "order-2 scale-110 z-10" : "order-1 opacity-90"
            }`}
            style={{ backgroundColor: "#111" }}
          >
            <p className="text-[var(--text-muted)]">waiting for Patient</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6 py-4 bg-[var(--bg-card)] rounded-b-2xl">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full ${
              muted ? "bg-red-500" : "bg-green-600"
            } hover:scale-110 transition`}
          >
            {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full ${
              cameraOff ? "bg-red-500" : "bg-blue-600"
            } hover:scale-110 transition`}
          >
            {cameraOff ? <FaVideoSlash /> : <FaVideo />}
          </button>
          <button
            onClick={() => endCall(false)}
            className="p-4 rounded-full bg-red-700 hover:scale-110 transition"
          >
            <FaPhoneSlash />
          </button>
        </div>
      </div>
    </div>
  );
}
