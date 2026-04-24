// FILE: src/pages/admin/SubscriptionSettings.jsx
import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import api from "../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PLACEHOLDER_LOGO = "/images/logo/Asset3.png";

// 10.5-month annualization (12 months with discount)
const calcAnnual = (m) => {
  const n = Number(m);
  if (!m || Number.isNaN(n) || n <= 0) return "";
  return (n * 10.5).toFixed(2);
};

export default function SubscriptionSettings() {
  const role = "ADMIN";
  const adminName =
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "Admin";

  const [loading, setLoading] = useState(false); // no hard gate
  const [saving, setSaving] = useState(false);

  // USD prices for Doctor, Patient, Pharmacy
  const [doctorMonthlyUsd, setDoctorMonthlyUsd] = useState("");
  const [doctorYearlyUsd, setDoctorYearlyUsd] = useState("");
  const [patientMonthlyUsd, setPatientMonthlyUsd] = useState("");
  const [patientYearlyUsd, setPatientYearlyUsd] = useState("");
  const [pharmacyMonthlyUsd, setPharmacyMonthlyUsd] = useState("");
  const [pharmacyYearlyUsd, setPharmacyYearlyUsd] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // ---------- helpers ----------
  const toNumStr = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? String(n) : "";
  };

  const pickSettingsPayload = (raw) => {
    // Supports {success:true, data:{...}} OR just {...}
    if (raw && typeof raw === "object") {
      if (raw.data && typeof raw.data === "object") return raw.data;
      return raw;
    }
    return {};
  };

  const getUpdatedAt = (payload) => payload?.updatedAt || null;

  // ---------- fetch prices ----------
  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/subscription/prices");
      const payload = pickSettingsPayload(res.data);

      setDoctorMonthlyUsd(toNumStr(payload.doctorMonthlyUsd));
      setDoctorYearlyUsd(toNumStr(payload.doctorYearlyUsd));
      setPatientMonthlyUsd(toNumStr(payload.patientMonthlyUsd));
      setPatientYearlyUsd(toNumStr(payload.patientYearlyUsd));
      setPharmacyMonthlyUsd(toNumStr(payload.pharmacyMonthlyUsd));
      setPharmacyYearlyUsd(toNumStr(payload.pharmacyYearlyUsd));
      setLastUpdated(getUpdatedAt(payload));
    } catch (err) {
      console.error("Failed to load subscription prices:", err);
      const msg = err?.response?.data?.error || "Failed to load subscription prices";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ load immediately on mount (no lazy gate)
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const handleSave = async (e) => {
    e.preventDefault();

    const fields = [
      ["Doctor monthly", doctorMonthlyUsd],
      ["Doctor yearly", doctorYearlyUsd],
      ["Patient monthly", patientMonthlyUsd],
      ["Patient yearly", patientYearlyUsd],
      ["Pharmacy monthly", pharmacyMonthlyUsd],
      ["Pharmacy yearly", pharmacyYearlyUsd],
    ];

    for (const [label, v] of fields) {
      const n = Number(v);
      if (!v || Number.isNaN(n) || n <= 0) {
        toast.error(`${label} must be a positive number`);
        return;
      }
    }

    try {
      setSaving(true);
      await api.put("/subscription/prices", {
        doctorMonthlyUsd: Number(doctorMonthlyUsd),
        doctorYearlyUsd: Number(doctorYearlyUsd),
        patientMonthlyUsd: Number(patientMonthlyUsd),
        patientYearlyUsd: Number(patientYearlyUsd),
        pharmacyMonthlyUsd: Number(pharmacyMonthlyUsd),
        pharmacyYearlyUsd: Number(pharmacyYearlyUsd),
      });
      toast.success("Subscription prices updated");
      await fetchPrices();
    } catch (err) {
      console.error("Failed to save subscription prices:", err);
      const msg = err?.response?.data?.error || "Failed to save subscription prices";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <Sidebar role={role} />

      <div className="flex-1 min-h-screen">
        <Topbar userName={adminName} />

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <img
              src="/images/logo/Asset3.png"
              alt="CureVirtual"
              style={{ width: 120, height: "auto" }}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_LOGO;
              }}
            />
            <h1 className="text-3xl font-bold text-[var(--text-main)]">
              Subscription Settings
            </h1>
          </div>

          {/* Current Prices (USD only) */}
          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Prices (USD)</h2>
              {loading && (
                <span className="text-xs text-[var(--text-soft)]">Syncing…</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-soft)] uppercase text-sm">
                    <th className="p-3">Role</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Price (USD)</th>
                    <th className="p-3">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Doctor */}
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3">Doctor</td>
                    <td className="p-3">Monthly</td>
                    <td className="p-3">
                      {doctorMonthlyUsd ? `$${Number(doctorMonthlyUsd).toFixed(2)}` : "—"}
                    </td>
                    <td className="p-3">
                      {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3">Doctor</td>
                    <td className="p-3">Yearly</td>
                    <td className="p-3">
                      {doctorYearlyUsd ? `$${Number(doctorYearlyUsd).toFixed(2)}` : "—"}
                    </td>
                    <td className="p-3">
                      {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
                    </td>
                  </tr>

                  {/* Patient */}
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3">Patient</td>
                    <td className="p-3">Monthly</td>
                    <td className="p-3">
                      {patientMonthlyUsd ? `$${Number(patientMonthlyUsd).toFixed(2)}` : "—"}
                    </td>
                    <td className="p-3">
                      {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3">Patient</td>
                    <td className="p-3">Yearly</td>
                    <td className="p-3">
                      {patientYearlyUsd ? `$${Number(patientYearlyUsd).toFixed(2)}` : "—"}
                    </td>
                    <td className="p-3">
                      {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
                    </td>
                  </tr>

                  {/* Pharmacy */}
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3">Pharmacy</td>
                    <td className="p-3">Monthly</td>
                    <td className="p-3">
                      {pharmacyMonthlyUsd ? `$${Number(pharmacyMonthlyUsd).toFixed(2)}` : "—"}
                    </td>
                    <td className="p-3">
                      {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">Pharmacy</td>
                    <td className="p-3">Yearly</td>
                    <td className="p-3">
                      {pharmacyYearlyUsd ? `$${Number(pharmacyYearlyUsd).toFixed(2)}` : "—"}
                    </td>
                    <td className="p-3">
                      {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Update Form — USD only */}
          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg max-w-3xl">
            <h2 className="text-xl font-semibold mb-4">Update Prices (USD)</h2>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold mb-2 text-[var(--text-main)]">
                  Doctor{" "}
                  <span className="text-xs text-[var(--text-soft)]">
                    (Yearly auto-calculates at 10.5× monthly)
                  </span>
                </h3>
              </div>
              <div className="col-span-1">
                <label className="block mb-1 text-[var(--text-soft)]">Monthly (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 25.00"
                  className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                  value={doctorMonthlyUsd}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDoctorMonthlyUsd(v);
                    setDoctorYearlyUsd(calcAnnual(v));
                  }}
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-1 text-[var(--text-soft)]">Yearly (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="auto"
                  className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                  value={doctorYearlyUsd}
                  onChange={(e) => setDoctorYearlyUsd(e.target.value)}
                  required
                />
              </div>

              {/* Patient */}
              <div className="col-span-2 mt-2">
                <h3 className="text-lg font-semibold mb-2 text-[var(--text-main)]">
                  Patient{" "}
                  <span className="text-xs text-[var(--text-soft)]">
                    (Yearly auto-calculates at 10.5× monthly)
                  </span>
                </h3>
              </div>
              <div className="col-span-1">
                <label className="block mb-1 text-[var(--text-soft)]">Monthly (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 10.00"
                  className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                  value={patientMonthlyUsd}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPatientMonthlyUsd(v);
                    setPatientYearlyUsd(calcAnnual(v));
                  }}
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-1 text-[var(--text-soft)]">Yearly (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="auto"
                  className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                  value={patientYearlyUsd}
                  onChange={(e) => setPatientYearlyUsd(e.target.value)}
                  required
                />
              </div>

              {/* Pharmacy */}
              <div className="col-span-2 mt-2">
                <h3 className="text-lg font-semibold mb-2 text-[var(--text-main)]">
                  Pharmacy{" "}
                  <span className="text-xs text-[var(--text-soft)]">
                    (Yearly auto-calculates at 10.5× monthly)
                  </span>
                </h3>
              </div>
              <div className="col-span-1">
                <label className="block mb-1 text-[var(--text-soft)]">Monthly (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 20.00"
                  className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                  value={pharmacyMonthlyUsd}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPharmacyMonthlyUsd(v);
                    setPharmacyYearlyUsd(calcAnnual(v));
                  }}
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-1 text-[var(--text-soft)]">Yearly (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="auto"
                  className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
                  value={pharmacyYearlyUsd}
                  onChange={(e) => setPharmacyYearlyUsd(e.target.value)}
                  required
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-[#027906] hover:bg-[#045d07] px-5 py-2 text-[var(--text-main)] font-semibold transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
