export default function HeroImage() {
  return (
    <div className="relative w-full max-w-[760px] mx-auto mt-2 px-4 sm:px-0 select-none mb-0 z-10 flex flex-col items-center justify-end">
      <img
        src="/images/clinicians.png"
        alt="Pakistani medical team clinicians"
        className="w-[90%] sm:w-[80%] md:w-[70%] lg:w-[65%] h-auto select-none mix-blend-multiply relative z-10 translate-y-[2px]"
        loading="lazy"
      />
    </div>
  );
}
