export default function HeroImage() {
  return (
    <div className="relative w-full max-w-[760px] mx-auto mt-2 px-4 sm:px-0 select-none mb-0 z-10 flex flex-col items-center justify-end">
      
      {/* Centered Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--hb-red-glow)] to-[var(--hb-green-glow)] -z-10 blur-[90px] rounded-full pointer-events-none opacity-40" />

      {/* Faded Red Globe Grid SVG Drawing (layered behind the image, no rounded clipping box) */}
      <div className="absolute inset-0 opacity-15 text-[var(--hb-red)] flex items-center justify-center pointer-events-none z-0">
        <svg className="w-[300px] h-[300px] xs:w-[360px] xs:h-[360px] sm:w-[480px] sm:h-[480px]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
          <circle cx="50" cy="50" r="45" />
          <ellipse cx="50" cy="50" rx="45" ry="18" />
          <ellipse cx="50" cy="50" rx="45" ry="32" />
          <ellipse cx="50" cy="50" rx="18" ry="45" />
          <ellipse cx="50" cy="50" rx="32" ry="45" />
          <line x1="5" y1="50" x2="95" y2="50" />
          <line x1="50" y1="5" x2="50" y2="95" />
        </svg>
      </div>

      {/* White silhouette mask to block globe lines behind doctors' bodies */}
      <div className="absolute bottom-0 w-[55%] h-[80%] bg-white rounded-t-[180px] z-5 pointer-events-none" />

      {/* Cutout Image of Doctors with Transparent Blend Effect (layered in front, sitting exactly on the bottom border joining stats band) */}
      <img
        src="/images/clinicians.png"
        alt="Pakistani medical team clinicians"
        className="w-[85%] sm:w-[75%] h-auto select-none mix-blend-multiply relative z-10 translate-y-[2px]"
      />

    </div>
  );
}
