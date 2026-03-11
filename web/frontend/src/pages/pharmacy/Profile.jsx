// FILE: src/pages/pharmacy/PharmacyProfile.jsx
import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PharmacyProfile() {
  const role = "PHARMACY";
  const userId = localStorage.getItem("userId") || "";
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Pharmacy";

  const [form, setForm] = useState({
    userId,
    firstName: "",
    lastName: "",
    displayName: "",
    licenseNumber: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    openingHours: "",
    services: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const normalizeLoaded = useCallback(
    (p = {}) => ({
      userId,
      firstName: p.user?.firstName ?? "",
      lastName: p.user?.lastName ?? "",
      displayName: p.displayName ?? "",
      licenseNumber: p.licenseNumber ?? "",
      phone: p.user?.phone || p.phone || "",
      address: p.address ?? "",
      city: p.city ?? "",
      state: p.state ?? "",
      country: p.country ?? "",
      postalCode: p.postalCode ?? "",
      latitude: p.latitude ?? "",
      longitude: p.longitude ?? "",
      openingHours: p.openingHours ?? "",
      services: p.services ?? "",
    }),
    [userId]
  );

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const r = await api.get("/pharmacy/profile", { params: { userId } });
      const payload = r?.data?.data ?? r?.data ?? null;
      if (payload) {
        setForm((prev) => ({ ...prev, ...normalizeLoaded(payload) }));
      }
    } catch (err) {
      console.error("GET /pharmacy/profile failed:", err);
      toast.error(err?.response?.data?.error || "Failed to load pharmacy profile");
    } finally {
      setLoading(false);
    }
  }, [userId, normalizeLoaded]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;

    const toNumOrNull = (v) => {
      if (v === "" || v === null || v === undefined) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    try {
      setSaving(true);
      const r = await api.put("/pharmacy/profile", {
        ...form,
        userId,
        latitude: toNumOrNull(form.latitude),
        longitude: toNumOrNull(form.longitude),
      });

      const msg = r?.data?.message || "Profile updated.";
      toast.success(msg);

      const saved = r?.data?.data ?? null;
      if (saved) {
        setForm(normalizeLoaded(saved));
      }
    } catch (err) {
      console.error("PUT /pharmacy/profile failed:", err);
      const msg = err?.response?.data?.error || "Failed to save profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-8">
        <div>
          <h2 className="text-[10px] font-black text-[var(--brand-green)] uppercase tracking-[0.3em] mb-1">
            Store Account
          </h2>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">
            Store Profile
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
            <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Name Row */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              {/* Business Info */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Display Name (Business Name)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    placeholder="Your Pharmacy Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                    placeholder="PHARM-XXXXXX"
                  />
                </div>
              </div>

              {/* Phone Row */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555-0123"
                />
              </div>

              {/* Address Section */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-bold text-[var(--brand-green)] uppercase tracking-wider mb-2 mt-2">
                  Location Details
                </h3>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Street Address
                </label>
                <input
                  type="text"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    State
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Country
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.latitude ?? ""}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    placeholder="e.g. 24.8607"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.longitude ?? ""}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    placeholder="e.g. 67.0011"
                  />
                </div>
              </div>

              {/* Operations */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-bold text-[var(--brand-green)] uppercase tracking-wider mb-2 mt-2">
                  Operations
                </h3>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Opening Hours
                </label>
                <textarea
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none h-24"
                  value={form.openingHours}
                  onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                  placeholder="Mon-Fri: 9AM-9PM, Sat: 10AM-6PM, Sun: Closed"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Services Offered
                </label>
                <textarea
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none h-24"
                  value={form.services}
                  onChange={(e) => setForm({ ...form, services: e.target.value })}
                  placeholder="Prescription dispensing, OTC medicines, Vaccinations"
                />
              </div>

              {/* Save Button */}
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
