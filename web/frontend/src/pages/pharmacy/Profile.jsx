// FILE: src/pages/pharmacy/PharmacyProfile.jsx
import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import api from "../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PharmacyProfile() {
  const role = "PHARMACY";
  const userId = localStorage.getItem("userId") || "";
  const userName =
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "Pharmacy";

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

  const normalizeLoaded = (p = {}) => ({
    userId,
    firstName: p.user?.firstName ?? "",
    lastName: p.user?.lastName ?? "",
    displayName: p.displayName ?? "",
    licenseNumber: p.licenseNumber ?? "",
    phone: p.user?.phone || p.phone || "", // Prefer user phone, fallback to profile phone
    address: p.address ?? "",
    city: p.city ?? "",
    state: p.state ?? "",
    country: p.country ?? "",
    postalCode: p.postalCode ?? "",
    latitude: p.latitude ?? "",    // keep as "" for inputs; convert on save
    longitude: p.longitude ?? "",
    openingHours: p.openingHours ?? "",
    services: p.services ?? "",
  });

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const r = await api.get("/pharmacy/profile", { params: { userId } });
      const payload = r?.data?.data ?? r?.data ?? null;
      if (payload) {
        setForm((prev) => ({ ...prev, ...normalizeLoaded(payload) }));
      } else {
        // auto-created empty profile is expected; no toast needed
      }
    } catch (err) {
      console.error("GET /pharmacy/profile failed:", err);
      toast.error(err?.response?.data?.error || "Failed to load pharmacy profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

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

      const msg = r?.data?.message || "✅ Profile saved";
      toast.success(msg);

      // refresh with canonical values from server
      const saved = r?.data?.data ?? null;
      if (saved) {
        setForm(normalizeLoaded(saved));
      }
    } catch (err) {
      console.error("PUT /pharmacy/profile failed:", err);
      const msg = err?.response?.data?.error || "❌ Failed to save profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const FI = ({ label, ...rest }) => (
    <div>
      <label className="block mb-1 text-[var(--text-soft)]">{label}</label>
      <input
        {...rest}
        className="w-full p-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)]"
      />
    </div>
  );

  return (
    <div className="flex bg-[#000000]/90 text-[var(--text-main)] min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <img
              src="/images/logo/Asset3.png"
              alt="CureVirtual"
              style={{ width: 120, height: "auto" }}
            />
            <h1 className="text-3xl font-bold text-[var(--text-main)]">Pharmacy Profile</h1>
            <div />
          </div>

          {loading ? (
            <p className="text-[var(--text-soft)]">Loading profile...</p>
          ) : (
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <FI
                label="First Name"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
              <FI
                label="Last Name"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
              <FI
                label="Display Name (Business Name)"
                value={form.displayName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayName: e.target.value }))
                }
              />
              <FI
                label="License Number"
                value={form.licenseNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, licenseNumber: e.target.value }))
                }
              />
              <FI
                label="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
              <FI
                label="Address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
              <FI
                label="City"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
              />
              <FI
                label="State"
                value={form.state}
                onChange={(e) =>
                  setForm((f) => ({ ...f, state: e.target.value }))
                }
              />
              <FI
                label="Country"
                value={form.country}
                onChange={(e) =>
                  setForm((f) => ({ ...f, country: e.target.value }))
                }
              />
              <FI
                label="Postal Code"
                value={form.postalCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, postalCode: e.target.value }))
                }
              />
              <FI
                label="Latitude"
                value={form.latitude ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, latitude: e.target.value }))
                }
                inputMode="decimal"
              />
              <FI
                label="Longitude"
                value={form.longitude ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, longitude: e.target.value }))
                }
                inputMode="decimal"
              />

              <div className="sm:col-span-2">
                <label className="block mb-1 text-[var(--text-soft)]">Opening Hours</label>
                <textarea
                  value={form.openingHours}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, openingHours: e.target.value }))
                  }
                  className="w-full p-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)] h-24"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-1 text-[var(--text-soft)]">Services</label>
                <textarea
                  value={form.services}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, services: e.target.value }))
                  }
                  className="w-full p-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)] h-24"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#027906] hover:bg-[#190366] rounded disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
