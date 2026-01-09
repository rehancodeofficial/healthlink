import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import api from "../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PLACEHOLDER_LOGO = "/images/logo/placeholder-logo.png";

export default function DoctorProfile() {
  const role = "DOCTOR";
  const userId = localStorage.getItem("userId") || "";
  const userName =
    localStorage.getItem("userName") || localStorage.getItem("name") || "Doctor";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    specialization: "",
    qualifications: "",
    licenseNumber: "",
    hospitalAffiliation: "",
    yearsOfExperience: "",
    consultationFee: "",
    availability: "",
    bio: "",
    languages: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctor/profile", { params: { userId } });
      const p = res.data?.data;
      if (p) {
        setForm({
          firstName: p.user?.firstName || "",
          lastName: p.user?.lastName || "",
          phone: p.user?.phone || "",
          specialization: p.specialization || "",
          qualifications: p.qualifications || "",
          licenseNumber: p.licenseNumber || "",
          hospitalAffiliation: p.hospitalAffiliation || "",
          yearsOfExperience: p.yearsOfExperience ?? "",
          consultationFee: p.consultationFee ?? "",
          availability: p.availability || "",
          bio: p.bio || "",
          languages: p.languages || "",
        });
      }
    } catch (err) {
      console.error("Failed to load doctor profile:", err);
      // If profile is auto-provisioned empty, this is fine; otherwise:
      toast.error("Update your Profile.");
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
    <div className="flex min-h-screen bg-[#000000]/90 text-[var(--text-main)]">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[var(--text-main)]">My Profile</h1>
            <img
              src="/images/logo/Asset2.png"
              alt="CureVirtual"
              style={{ width: 120, height: "auto" }}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_LOGO; }}
            />
          </div>

          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg max-w-4xl">
            {loading ? (
              <p className="text-[var(--text-soft)]">Loading...</p>
            ) : (
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">First Name</label>
                  <input
                    type="text"
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">Last Name</label>
                  <input
                    type="text"
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">Phone Number</label>
                  <input
                    type="text"
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                    value={form.phone}
                    onChange={handleChange("phone")}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">Specialization</label>
                  <input
                    type="text"
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                    value={form.specialization}
                    onChange={handleChange("specialization")}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">Qualifications</label>
                  <input
                    type="text"
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                    value={form.qualifications}
                    onChange={handleChange("qualifications")}
                    placeholder="e.g. MBBS, MD"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">License Number</label>
                  <input
                    type="text"
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                    value={form.licenseNumber}
                    onChange={handleChange("licenseNumber")}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">Hospital Affiliation</label>
                  <input
                    type="text"
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                    value={form.hospitalAffiliation}
                    onChange={handleChange("hospitalAffiliation")}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                    value={form.yearsOfExperience}
                    onChange={handleChange("yearsOfExperience")}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">Consultation Fee (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                    value={form.consultationFee}
                    onChange={handleChange("consultationFee")}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">Availability</label>
                  <textarea
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)] h-24"
                    value={form.availability}
                    onChange={handleChange("availability")}
                    placeholder='e.g. {"monday":"9-5","tuesday":"10-4"} or free text'
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">Bio</label>
                  <textarea
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)] h-24"
                    value={form.bio}
                    onChange={handleChange("bio")}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-[var(--text-soft)]">Languages</label>
                  <input
                    type="text"
                    className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                    value={form.languages}
                    onChange={handleChange("languages")}
                    placeholder='e.g. English, French'
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded bg-[#027906] hover:bg-[#045d07] px-5 py-2 font-semibold"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
