export default function HeroImage() {
  return (
    <div className="relative w-full max-w-[920px] mx-auto mt-[-30px] sm:mt-[-50px] px-4 sm:px-0 select-none mb-[-140px] sm:mb-[-220px] z-10">
      
      {/* Centered Ambient Glow */}
      <div className="absolute inset-[-30px] bg-gradient-to-tr from-[var(--hb-red-glow)] to-[var(--hb-green-glow)] -z-10 blur-[90px] rounded-full pointer-events-none opacity-50" />

      {/* Circle Container with Faded Red Glow & Globe BG (mix-blend-multiply applied here to wipe out all white background) */}
      <div className="relative w-[360px] h-[360px] xs:w-[440px] xs:h-[440px] sm:w-[580px] sm:h-[580px] mx-auto rounded-full overflow-hidden flex items-end justify-center mix-blend-multiply">
        
        {/* Faded Red Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--hb-red)]/10 via-[var(--hb-red)]/5 to-transparent pointer-events-none z-0" />

        {/* Faded Red Globe Grid SVG Drawing (layered behind the image) */}
        <div className="absolute inset-8 opacity-15 text-[var(--hb-red)] flex items-center justify-center pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="50" cy="50" r="45" />
            <ellipse cx="50" cy="50" rx="45" ry="18" />
            <ellipse cx="50" cy="50" rx="45" ry="32" />
            <ellipse cx="50" cy="50" rx="18" ry="45" />
            <ellipse cx="50" cy="50" rx="32" ry="45" />
            <line x1="5" y1="50" x2="95" y2="50" />
            <line x1="50" y1="5" x2="50" y2="95" />
          </svg>
        </div>

        {/* Cutout Image of Doctors (layered in front) */}
        <img
          src="/images/clinicians.png"
          alt="Pakistani medical team clinicians"
          className="w-[85%] h-auto select-none relative z-10 translate-y-1"
        />
      </div>

    </div>
  );
}
