import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import api from "../Lib/api";

/**
 * ZegoVideoCall — Reusable ZEGO video call component using the UI Kit.
 *
 * Props:
 *  - roomName    (string, required)  Unique room identifier (appointmentId)
 *  - userId      (string, required)  User's unique ID
 *  - userName    (string)           User's display name
 *  - onClose     (function)         Called when meeting ends / user hangs up
 */
export default function ZegoVideoCall({ roomName, userId, userName = "User", onClose }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const zpRef = useRef(null);

  useEffect(() => {
    let active = true;

    const initCall = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch kitToken from backend
        // The backend returns the raw base64 string
        const response = await api.get("/zego/token", {
          params: { roomId: roomName, userId, userName },
        });

        if (!active) return;

        const kitToken = response.data;
        if (!kitToken || typeof kitToken !== "string") {
          throw new Error("Invalid kitToken received from backend");
        }

        // 2. Initialize ZEGO UI Kit using the backend-provided kitToken
        console.log("[ZEGO] Initializing with backend-generated kitToken...");

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        // 3. Start the call
        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showPreJoinView: false,
          showUserList: false,
          showScreenSharingButton: true,
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          onLeaveRoom: () => {
            if (onClose) onClose();
          },
          onUserJoin: (users) => {
            console.log("[ZEGO] User joined:", users);
          },
          onUserLeave: (users) => {
            console.log("[ZEGO] User left:", users);
          },
        });

        // 4. Update status to ONGOING
        if (roomName.startsWith("consult_")) {
          const consultationId = roomName.split("_")[1];
          api
            .put(`/videocall/status/${consultationId}`, { status: "ONGOING" })
            .catch((err) => console.error("Failed to update status to ONGOING:", err));
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to initialize ZEGO:", err);
        if (active) {
          setError(err.response?.data?.error || err.message || "Failed to load video call");
          setLoading(false);
        }
      }
    };

    if (roomName && userId) {
      initCall();
    }

    return () => {
      active = false;
      if (zpRef.current) {
        // zp.destroy() or similar if available, but usually UI Kit handles it or
        // we just let the component unmount.
      }
    };
  }, [roomName, userId, userName, onClose]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-900 text-white p-6 rounded-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-3xl mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p className="text-gray-400 text-center max-w-md mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-green-500 text-black rounded-xl font-bold hover:bg-green-400 transition-colors"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden rounded-2xl shadow-2xl">
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase">
            Connecting to Secure Session...
          </p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: "600px" }} />
    </div>
  );
}
