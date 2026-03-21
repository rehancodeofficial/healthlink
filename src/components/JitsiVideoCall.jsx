import { useEffect, useRef, useState } from "react";

/**
 * JitsiVideoCall — Reusable Jitsi Meet component using the External API.
 *
 * Props:
 *  - roomName   (string, required)  Unique room identifier
 *  - displayName (string)           User's display name in the call
 *  - onClose     (function)         Called when meeting ends / user hangs up
 *  - onApiReady  (function)         Called with the JitsiMeetExternalAPI instance
 *  - height      (string)           CSS height, defaults to "100%"
 *  - width       (string)           CSS width, defaults to "100%"
 */
export default function JitsiVideoCall({
  roomName,
  displayName = "User",
  onClose,
  onApiReady,
  height = "100%",
  width = "100%",
}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stable refs for callbacks to avoid re-creating the Jitsi instance
  const onCloseRef = useRef(onClose);
  const onApiReadyRef = useRef(onApiReady);
  onCloseRef.current = onClose;
  onApiReadyRef.current = onApiReady;

  useEffect(() => {
    if (!roomName) return;

    let destroyed = false;
    let api = null;

    const loadJitsi = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamically load the Jitsi External API script if not already loaded
        if (!window.JitsiMeetExternalAPI) {
          await new Promise((resolve, reject) => {
            // Check if script is already in the DOM
            const existing = document.querySelector(
              'script[src="https://meet.jit.si/external_api.js"]'
            );
            if (existing) {
              existing.addEventListener("load", resolve);
              existing.addEventListener("error", reject);
              return;
            }

            const script = document.createElement("script");
            script.src = "https://meet.jit.si/external_api.js";
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load Jitsi External API"));
            document.head.appendChild(script);
          });
        }

        if (destroyed) return;

        // Check for devices
        let hasCamera = false;
        let hasMic = false;

        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          hasCamera = devices.some((device) => device.kind === "videoinput");
          hasMic = devices.some((device) => device.kind === "audioinput");
          console.log(`[Jitsi] Devices detected - Camera: ${hasCamera}, Mic: ${hasMic}`);
        } catch (err) {
          console.warn("[Jitsi] Failed to check devices, assuming strict fallback:", err);
          // If detection fails, assume nothing is guaranteed and let Jitsi try its best
          // or default to audio-only if we want to be safe.
          hasCamera = false;
          hasMic = true; // Assume at least a mic exists or is allowed
        }

        // Configuration overrides
        const configOverrides = {
          startWithAudioMuted: !hasMic,
          startWithVideoMuted: !hasCamera,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableClosePage: false,
          disableInviteFunctions: true,
          // Use ideal constraints for better compatibility
          constraints: {
            video: hasCamera
              ? {
                  height: { ideal: 720, max: 1080, min: 240 },
                  width: { ideal: 1280, max: 1920, min: 320 },
                }
              : false,
            audio: hasMic,
          },
          toolbarButtons: [
            "chat",
            "settings",
            "raisehand",
            "tileview",
            "desktop",
            "fullscreen",
            "hangup",
          ],
        };

        // Add device-specific buttons if devices exist
        if (hasMic) configOverrides.toolbarButtons.unshift("microphone");
        if (hasCamera) {
          configOverrides.toolbarButtons.splice(1, 0, "camera", "toggle-camera");
        }

        // Disable analytics in development to avoid Amplitude errors
        if (import.meta.env.DEV) {
          configOverrides.analytics = {
            disabled: true,
          };
        }

        // Initialize the Jitsi Meet External API
        api = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName: roomName,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName: displayName,
          },
          configOverrides: configOverrides,
          interfaceConfigOverrides: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DEFAULT_BACKGROUND: "#111827", // Tailwind gray-900
            TOOLBAR_ALWAYS_VISIBLE: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            FILM_STRIP_MAX_HEIGHT: 120,
          },
        });

        apiRef.current = api;

        // --- Event Listeners ---

        api.addEventListener("videoConferenceJoined", (e) => {
          console.log("[Jitsi] Joined conference:", e);
          setLoading(false);
          // If we are in listen-only mode, notify the user
          if (!hasMic) {
            api.executeCommand("showNotification", {
              title: "Listen Only Mode",
              description: "No microphone detected. You can hear others but they cannot hear you.",
              type: "warning",
            });
          }
        });

        api.addEventListener("participantJoined", (e) => {
          console.log("[Jitsi] Participant joined:", e);
        });

        api.addEventListener("participantLeft", (e) => {
          console.log("[Jitsi] Participant left:", e);
        });

        api.addEventListener("cameraError", (e) => {
          console.error("[Jitsi] Camera error:", e);
          // If camera fails mid-call or on start, we could try to downgrade to audio only
          if (e.type === "gum.not_found" || e.type === "gum.permission_denied") {
            // Already handled by initial detection, but good for runtime errors
          }
        });

        api.addEventListener("micError", (e) => {
          console.error("[Jitsi] Mic error:", e);
        });

        api.addEventListener("readyToClose", () => {
          if (onCloseRef.current) onCloseRef.current();
        });

        api.addEventListener("videoConferenceLeft", () => {
          if (onCloseRef.current) onCloseRef.current();
        });

        // Expose the API instance for advanced control
        if (onApiReadyRef.current) onApiReadyRef.current(api);
      } catch (err) {
        console.error("❌ Failed to initialize Jitsi:", err);
        setError(err.message || "Failed to load video call");
        setLoading(false);
      }
    };

    loadJitsi();

    // Cleanup: destroy the Jitsi instance on unmount
    return () => {
      destroyed = true;
      if (api) {
        try {
          api.dispose();
        } catch (e) {
          console.warn("Failed to dispose Jitsi API:", e);
        }
        apiRef.current = null;
      }
    };
  }, [roomName, displayName]); // Re-run if roomName or displayName changes

  if (error) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fff",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          ⚠️
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Connection Error</h2>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            margin: 0,
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 32px",
            background: "#22c55e",
            color: "#000",
            border: "none",
            borderRadius: 12,
            fontWeight: 800,
            cursor: "pointer",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ width, height, position: "relative", background: "#0a0a0a" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            zIndex: 10,
            gap: "16px",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: "#22c55e",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
            }}
          >
            Connecting to Secure Session...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
