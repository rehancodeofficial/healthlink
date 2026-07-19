import Navbar from "../../components/navbar/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaSearch, FaStar, FaUserCheck, FaCalendarAlt, FaLanguage, FaAward, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import VideoSlot from "../../components/ui/VideoSlot";

export default function Doctors() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  const doctorsList = [
    {
      id: 1,
      name: "Dr. Amara Khan",
      specialty: "Cardiology",
      credentials: "MBBS, FCPS (Cardiology)",
      experience: "12 years",
      rating: "4.9",
      reviews: "142",
      languages: "English, Urdu",
      nextAvailable: "Today, 3:00 PM",
      img: "/images/doctors/amara.png"
    },
    {
      id: 2,
      name: "Dr. Bilal Ahmed",
      specialty: "Pediatrics",
      credentials: "MBBS, DCH, MD",
      experience: "9 years",
      rating: "4.8",
      reviews: "98",
      languages: "English, Urdu, Punjabi",
      nextAvailable: "Today, 4:30 PM",
      img: "/images/doctors/bilal.png"
    },
    {
      id: 3,
      name: "Dr. Farhan Yousaf",
      specialty: "General Physician",
      credentials: "MBBS, MCPS",
      experience: "15 years",
      rating: "4.9",
      reviews: "210",
      languages: "English, Urdu",
      nextAvailable: "Today, 2:00 PM",
      img: "/images/doctors/farhan.png"
    },
    {
      id: 4,
      name: "Dr. Sara Malik",
      specialty: "Dermatology",
      credentials: "MBBS, FCPS (Dermatology)",
      experience: "10 years",
      rating: "4.9",
      reviews: "176",
      languages: "English, Urdu",
      nextAvailable: "Tomorrow, 11:00 AM",
      img: "/images/doctors/sara.png"
    },
    {
      id: 5,
      name: "Dr. Tariq Mahmood",
      specialty: "Internal Medicine",
      credentials: "MBBS, MRCP (UK)",
      experience: "18 years",
      rating: "4.9",
      reviews: "320",
      languages: "English, Urdu",
      nextAvailable: "Today, 5:15 PM",
      img: "/images/doctors/tariq.png"
    },
    {
      id: 6,
      name: "Dr. Zainab Raza",
      specialty: "Gynecology",
      credentials: "MBBS, FCPS (OB/GYN)",
      experience: "11 years",
      rating: "4.8",
      reviews: "115",
      languages: "English, Urdu",
      nextAvailable: "Tomorrow, 2:30 PM",
      img: "/images/doctors/zainab.png"
    }
  ];

  const specialtiesFilter = ["All", "General Physician", "Cardiology", "Pediatrics", "Dermatology", "Internal Medicine", "Gynecology"];

  const filteredDoctors = doctorsList.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All" || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none -z-20"></div>

      <div className="blur-blob-red top-[-100px] left-[-50px]"></div>
      <div className="blur-blob-green top-[300px] right-[-100px]"></div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-36 pb-24 space-y-20">
        {/* Hero Banner with video background */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border)]">
          <VideoSlot
            src="doctors-header.mp4"
            label="Clinic hallway / modern corridor background"
            searchTerms="clinic hallway, modern hospital corridor, medical professional walking"
            overlay={70}
            height="h-auto"
            rounded="rounded-none"
            mode="background"
            className="py-20 px-6"
          >
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              <span className="clay-pressed inline-block px-4 py-1.5 border border-white/20 text-[10px] font-black uppercase tracking-widest text-[var(--hb-red)] bg-white/10 text-white">
                Our Medical Panel
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[1.1]">
                Find the right doctor, not just any doctor
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-medium">
                Every doctor on HealthLink is licensed, credential-verified, and rated by real patients.
              </p>
            </div>
          </VideoSlot>
        </section>

        {/* Filter Bar */}
        <section className="glass-clay p-6 rounded-3xl border border-[var(--border)] space-y-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--hb-ink-soft)]" />
            <input
              type="text"
              placeholder="Search by name, specialty, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--hb-red)] font-medium text-sm text-[var(--hb-ink)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--hb-ink-soft)] mr-2">
              Filter Specialty:
            </span>
            {specialtiesFilter.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedSpecialty === spec
                    ? "bg-[var(--hb-red)] text-white border-[var(--hb-red)] shadow-md"
                    : "bg-[var(--bg-main)] text-[var(--hb-ink-soft)] border-[var(--border)] hover:border-[var(--hb-red)]"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </section>

        {/* Doctor Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="glass-clay p-6 rounded-[2rem] border border-[var(--border)] space-y-5 hover:-translate-y-1.5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 overflow-hidden border border-[var(--border)] flex-shrink-0">
                    <img src={doc.img} alt={doc.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--hb-ink)] tracking-tight">{doc.name}</h3>
                    <span className="text-xs font-bold text-[var(--hb-red)] uppercase tracking-wider block">
                      {doc.specialty}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--hb-ink-soft)] block opacity-80">
                      {doc.credentials}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-medium text-[var(--hb-ink-soft)] pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center gap-1.5">
                    <FaAward className="text-amber-500" />
                    <span>{doc.experience} exp</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaStar className="text-amber-400" />
                    <span>{doc.rating} ({doc.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <FaLanguage className="text-blue-500" />
                    <span>{doc.languages}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2 text-emerald-600 font-bold">
                    <FaCalendarAlt />
                    <span>Next Available: {doc.nextAvailable}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/patient/book-appointment?doctorId=${doc.id}`)}
                className="btn-clay-primary w-full py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>View Profile & Book</span>
                <FaArrowRight size={10} />
              </button>
            </div>
          ))}
        </section>

        {/* Why Our Doctors */}
        <section className="glass-clay p-10 sm:p-14 rounded-[2.5rem] border border-[var(--border)] space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
              Verification Standards
            </h2>
            <h3 className="text-3xl font-black tracking-tighter">
              Every doctor on HealthLink is verified before they see a single patient
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm font-medium text-[var(--hb-ink-soft)]">
            <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] space-y-2">
              <FaUserCheck className="text-2xl text-[var(--hb-red)]" />
              <h4 className="font-bold text-[var(--hb-ink)]">Verified Credentials</h4>
              <p className="text-xs">Every license, degree, and certification is checked against medical registries before joining.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] space-y-2">
              <FaStar className="text-2xl text-amber-500" />
              <h4 className="font-bold text-[var(--hb-ink)]">Rated by Real Patients</h4>
              <p className="text-xs">Transparent patient reviews and star ratings published after every consultation.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] space-y-2">
              <FaAward className="text-2xl text-blue-500" />
              <h4 className="font-bold text-[var(--hb-ink)]">Specialized Expertise</h4>
              <p className="text-xs">From general practitioners to niche sub-specialists across 12+ medical fields.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] space-y-2">
              <FaLanguage className="text-2xl text-emerald-500" />
              <h4 className="font-bold text-[var(--hb-ink)]">Multilingual Care</h4>
              <p className="text-xs">Consult comfortably in English, Urdu, or regional languages with your physician.</p>
            </div>
          </div>
        </section>

        {/* Join as a Doctor */}
        <section className="bg-[var(--hb-ink)] text-white p-10 sm:p-14 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 select-none">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-xs font-black text-[var(--hb-red)] uppercase tracking-[0.3em]">
              For Physicians
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">
              Practice on your own schedule
            </h3>
            <p className="text-sm text-[var(--hb-ink-soft)] font-medium max-w-xl">
              Set your own hours, consult from anywhere, and deliver high-quality telemedicine without physical clinic overhead.
            </p>
          </div>

          <button
            onClick={() => navigate("/register")}
            className="btn-clay-primary px-8 py-4 text-xs font-semibold uppercase tracking-wider flex-shrink-0"
          >
            Apply to Join Panel
          </button>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 glass-clay p-12 rounded-[2.5rem] border border-[var(--border)] max-w-3xl mx-auto">
          <h2 className="text-3xl font-black tracking-tighter">
            Can't decide who to book?
          </h2>
          <p className="text-base text-[var(--hb-ink-soft)] font-medium">
            Answer a few quick questions and we'll match you with the right specialist for your condition.
          </p>
          <button
            onClick={() => navigate("/appointments")}
            className="btn-clay-primary px-9 py-4 text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <span>Find My Doctor</span>
            <FaArrowRight size={12} />
          </button>
        </section>
      </main>

      <footer className="py-12 border-t border-[var(--border)] text-center text-xs font-bold text-[var(--hb-ink-soft)] uppercase tracking-widest">
        &copy; 2026 HealthLink. All Rights Reserved.
      </footer>
    </div>
  );
}
