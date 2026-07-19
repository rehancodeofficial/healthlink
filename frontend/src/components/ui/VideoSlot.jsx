import { useRef, useState, useEffect } from "react";
import { FaPlay, FaFilm } from "react-icons/fa";

/**
 * VideoSlot — drop-in video background or decorative video panel.
 *
 * Props:
 *   src          – path inside /public/videos/, e.g. "home-hero.mp4"
 *   label        – human-readable label shown in the placeholder
 *   searchTerms  – comma-separated stock search hint (Pexels / Pixabay)
 *   overlay      – opacity 0-100 of the dark overlay (default 50)
 *   rounded      – tailwind rounded class (default "rounded-[2.5rem]")
 *   height       – tailwind height class (default "h-[460px]")
 *   children     – content rendered on top of the video / placeholder
 *   mode         – "background" (full-bleed behind children) | "panel" (standalone decorative video)
 */
export default function VideoSlot({
  src,
  label = "Video",
  searchTerms = "",
  overlay = 50,
  rounded = "rounded-[2.5rem]",
  height = "h-[460px]",
  children,
  mode = "background",
  className = "",
}) {
  const videoRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const fullSrc = src ? `/videos/${src}` : null;

  useEffect(() => {
    // Reset if src changes
    setLoaded(false);
    setError(false);
  }, [src]);

  const showPlaceholder = !fullSrc || error;

  const Placeholder = () => (
    <div
      className={`
        ${height} ${rounded} ${className}
        flex flex-col items-center justify-center gap-6
        bg-gradient-to-br from-[var(--bg-glass)] to-[var(--bg-main)]
        border-2 border-dashed border-[var(--border)]
        text-center px-8 select-none relative overflow-hidden
      `}
    >
      {/* decorative blobs */}
      <div className="absolute w-64 h-64 rounded-full bg-[var(--hb-red)]/5 -top-20 -left-20 blur-3xl" />
      <div className="absolute w-64 h-64 rounded-full bg-blue-500/5 -bottom-20 -right-20 blur-3xl" />

      <div className="relative z-10 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--hb-red)]/10 border border-[var(--hb-red)]/20 flex items-center justify-center mx-auto">
          <FaFilm className="text-2xl text-[var(--hb-red)] opacity-60" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--hb-red)] opacity-80">
            Video Slot
          </p>
          <p className="text-base font-bold text-[var(--text-main)] opacity-70">
            {label}
          </p>
        </div>

        {fullSrc ? (
          <p className="text-[11px] font-medium text-[var(--text-soft)] opacity-60 max-w-xs">
            Place your video at <code className="bg-[var(--bg-main)] px-1.5 py-0.5 rounded font-mono text-[10px]">/public/videos/{src}</code>
          </p>
        ) : (
          <p className="text-[11px] font-medium text-[var(--text-soft)] opacity-60 max-w-xs leading-relaxed">
            Download a free stock clip from{" "}
            <a href={`https://mixkit.co/free-stock-video/medical/`} target="_blank" rel="noopener noreferrer" className="underline text-[var(--hb-red)]">Mixkit</a>
            {" "}or{" "}
            <a href={`https://www.pexels.com/search/videos/${encodeURIComponent(searchTerms.split(",")[0]?.trim() || label)}/`} target="_blank" rel="noopener noreferrer" className="underline text-[var(--hb-red)]">Pexels</a>
          </p>
        )}

        {searchTerms && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] opacity-50">
            Search: {searchTerms}
          </p>
        )}
      </div>

      {children && (
        <div className="relative z-10 w-full">
          {children}
        </div>
      )}
    </div>
  );

  if (showPlaceholder) return <Placeholder />;

  if (mode === "panel") {
    return (
      <div className={`relative ${height} ${rounded} ${className} overflow-hidden border border-[var(--border)] shadow-2xl`}>
        {!loaded && (
          <div className="absolute inset-0 bg-[var(--bg-glass)] flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-[var(--hb-red)] border-t-transparent animate-spin" />
          </div>
        )}
        <video
          ref={videoRef}
          src={fullSrc}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        {children && (
          <div className="relative z-10 h-full flex items-center justify-center">
            {children}
          </div>
        )}
      </div>
    );
  }

  // mode === "background"
  return (
    <div className={`relative ${height} ${rounded} ${className} overflow-hidden`}>
      {!loaded && (
        <div className="absolute inset-0 bg-[var(--hb-ink)] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--hb-red)] border-t-transparent animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        src={fullSrc}
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: `rgba(0,0,0,${overlay / 100})` }}
      />
      {children && (
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
          {children}
        </div>
      )}
    </div>
  );
}
