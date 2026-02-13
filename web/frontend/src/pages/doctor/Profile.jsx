import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Psychiatry",
  "Orthopedics",
  "Gynecology",
  "Ophthalmology",
  "ENT",
  "Dental",
  "Other"
];

export default function DoctorProfile() {
  const role = "DOCTOR";
  const userId = localStorage.getItem("userId") || "";
  const userName =
    localStorage.getItem("userName") || localStorage.getItem("name") || "Doctor";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    specialization: "General Medicine",
    customProfession: "",
    qualifications: "",
    licenseNumber: "",
    hospitalAffiliation: "",
    yearsOfExperience: "",
    consultationFee: "",
    availability: "",
    bio: "",
    languages: "",
    emergencyContact: "",
    emergencyContactName: "",
    emergencyContactEmail: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctor/profile", { params: { userId } });
      const p = res.data?.data;
      if (p) {
        setForm({
          firstName: p.user?.firstName || "",
          middleName: p.user?.middleName || "",
          lastName: p.user?.lastName || "",
          phone: p.user?.phone || "",
          specialization: p.specialization || "General Medicine",
          customProfession: p.customProfession || "",
          qualifications: p.qualifications || "",
          licenseNumber: p.licenseNumber || "",
          hospitalAffiliation: p.hospitalAffiliation || "",
          yearsOfExperience: p.yearsOfExperience ?? "",
          consultationFee: p.consultationFee ?? "",
          availability: p.availability || "",
          bio: p.bio || "",
          languages: p.languages || "",
          emergencyContact: p.emergencyContact || "",
          emergencyContactName: p.emergencyContactName || "",
          emergencyContactEmail: p.emergencyContactEmail || "",
        });
      }
    } catch (err) {
      console.error("Failed to load doctor profile:", err);
      toast.error("Complete your profile configuration.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadProfile();
  }, [loadProfile, userId]);

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.qualifications || !form.licenseNumber) {
        toast.error("Please fill in Qualifications and License Number.");
        return;
    }
    if (form.specialization === "Other" && !form.customProfession) {
        toast.error("Please specify your profession.");
        return;
    }
    try {
      setSaving(true);
      await api.put("/doctor/profile", {
        userId,
        ...form,
        yearsOfExperience:
          form.yearsOfExperience === "" ? null : Number(form.yearsOfExperience),
        consultationFee:
          form.consultationFee === "" ? null : Number(form.consultationFee),
      });
      toast.success("Profile updated successfully!");
      await loadProfile();
    } catch (err) {
      console.error("Failed to save doctor profile:", err);
      toast.error(err?.response?.data?.error || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-8">
        <div>
          <h2 className="text-[10px] font-black text-[var(--brand-green)] uppercase tracking-[0.3em] mb-1">
            Professional Account
          </h2>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">
            Doctor Profile
          </h1>
        </div>

        <div className="card !p-8 max-w-5xl">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="h-10 w-10 border-4 border-[var(--brand-green)]/20 border-t-[var(--brand-green)] rounded-full animate-spin"></div>
               <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] animate-pulse">
                 Loading Profile...
               </p>
             </div>
            ) : (
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Name Row */}
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">First Name</label>
                    <input
                      type="text"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.firstName}
                      onChange={handleChange("firstName")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Middle Name</label>
                    <input
                      type="text"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.middleName}
                      onChange={handleChange("middleName")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.lastName}
                      onChange={handleChange("lastName")}
                    />
                  </div>
                </div>

                {/* Phone Row */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Phone Number</label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.phone}
                    onChange={handleChange("phone")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Specialization</label>
                  <select
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.specialization}
                    onChange={handleChange("specialization")}
                    required
                  >
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {form.specialization === "Other" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Specify Profession</label>
                    <input
                      type="text"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.customProfession}
                      onChange={handleChange("customProfession")}
                      placeholder="e.g. Holistic Healer"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Qualifications</label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.qualifications}
                    onChange={handleChange("qualifications")}
                    placeholder="e.g. MBBS, MD"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">License Number</label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.licenseNumber}
                    onChange={handleChange("licenseNumber")}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Hospital Affiliation</label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.hospitalAffiliation}
                    onChange={handleChange("hospitalAffiliation")}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.yearsOfExperience}
                    onChange={handleChange("yearsOfExperience")}
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Consultation Fee (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.consultationFee}
                    onChange={handleChange("consultationFee")}
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Availability</label>
                  <textarea
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none h-24"
                    value={form.availability}
                    onChange={handleChange("availability")}
                    placeholder='e.g. {"monday":"9-5","tuesday":"10-4"} or free text'
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Bio</label>
                  <textarea
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none h-24"
                    value={form.bio}
                    onChange={handleChange("bio")}
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Languages</label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.languages}
                    onChange={handleChange("languages")}
                    placeholder='e.g. English, French'
                  />
                </div>


                {/* Emergency Contact */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-[var(--brand-green)] uppercase tracking-wider mb-2 mt-4">Emergency Contact</h3>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.emergencyContactName}
                      onChange={handleChange("emergencyContactName")}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.emergencyContactEmail}
                      onChange={handleChange("emergencyContactEmail")}
                      placeholder="emergency@example.com"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Additional Details (Relation, Phone, etc.)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.emergencyContact}
                      onChange={handleChange("emergencyContact")}
                      placeholder="Mother - +1 555-0123"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-start pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-[#027906] hover:bg-[#045d07] px-8 py-3 text-white font-bold tracking-wider uppercase text-xs shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
