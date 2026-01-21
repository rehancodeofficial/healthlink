import { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../Lib/api";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

/* tiny toast */
function Toast({ text, onClose }) {
  if (!text) return null;
  return (
    <div
      className="fixed top-6 right-6 bg-[#027906] text-[var(--text-main)] px-5 py-3 rounded-lg shadow-lg z-50"
      style={{ animation: "fadeInOut 3s ease forwards" }}
      onAnimationEnd={onClose}
    >
      {text}
    </div>
  );
}

/* inject keyframes once */
if (typeof document !== "undefined" && !document.getElementById("cv-fade-styles")) {
  const style = document.createElement("style");
  style.id = "cv-fade-styles";
  style.innerHTML = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }`;
  document.head.appendChild(style);
}

const Pill = ({ value }) => {
  const v = (value || "").toUpperCase();
  const cls =
    v === "ACTIVE"
      ? "bg-[#027906] text-white"
      : v === "PENDING"
      ? "bg-amber-500 text-black"
      : v === "EXPIRED"
      ? "bg-red-600 text-white"
      : v === "DEACTIVATED"
      ? "bg-gray-600 text-white"
      : v === "FAILED"
      ? "bg-red-700 text-white"
      : "bg-gray-500 text-white";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {v}
    </span>
  );
};

export default function PharmacySubscription() {
  const role = "PHARMACY";
  const userId = localStorage.getItem("userId");
  const userName =
    localStorage.getItem("userName") || localStorage.getItem("name") || "Pharmacy";

  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState({ monthlyUsd: null, yearlyUsd: null });
  const [status, setStatus] = useState({
    status: "UNSUBSCRIBED",
    startDate: null,
    endDate: null,
    plan: null,
    provider: null,
  });
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);

      // 1) Subscription settings (prices)
      const setRes = await api.get("/subscription/settings");
      const setData = setRes.data?.data || {};
      setPrices({
        monthlyUsd: setData.pharmacyMonthlyUsd ?? null,
        yearlyUsd: setData.pharmacyYearlyUsd ?? null,
      });

      // 2) Current status
      // 2) Current status
      const st = await api.get("/subscription/status", {
        params: { userId },
      });
      const s = st.data?.data || {};
      setStatus({
        status: s.status || "UNSUBSCRIBED",
        startDate: s.startDate || null,
        endDate: s.endDate || null,
        plan: s.plan || null,
        provider: s.provider || null,
      });

      // 3) Payment history
      const hist = await api.get("/subscription/history", {
        params: { userId },
      });
      setHistory(Array.isArray(hist.data) ? hist.data : hist.data?.data || []);
    } catch (e) {
      console.error("❌ Subscription load failed:", e);
      setToast("Failed to load subscription info");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const active = useMemo(
    () => (status.status || "").toUpperCase() === "ACTIVE",
    [status.status]
  );

  const handleSubscribe = async (plan) => {
    try {
      // Prefer PAYSTACK in NG; fallback to STRIPE if backend uses it
      const provider = "PAYSTACK";
      const successUrl = `${window.location.origin}/pharmacy/subscription`;
      const cancelUrl = `${window.location.origin}/pharmacy/subscription`;

      const res = await api.post("/subscription/stripe/checkout", {
        userId,
        plan, // "MONTHLY" | "YEARLY"
      });

      const data = res.data || {};
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl; // Paystack/Stripe hosted checkout URL
        return;
      }
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
        return;
      }
      // Optional: Stripe session id (if using client-side redirect elsewhere)
      if (data.sessionId) {
        // You can store and redirect with Stripe.js if needed
        setToast("Checkout session created. Please complete payment.");
        return;
      }
      setToast("Unable to start checkout. Try again.");
    } catch (e) {
      console.error("❌ Checkout start failed:", e);
      const msg = e?.response?.data?.error || "Failed to start checkout";
      setToast(`❌ ${msg}`);
    }
  };

  const now = Date.now();
  const expiresSoon = useMemo(() => {
    if (!status.endDate) return false;
    const end = new Date(status.endDate).getTime();
    const daysLeft = (end - now) / (1000 * 60 * 60 * 24);
    return daysLeft <= 5; // show gentle nudge if 5 days or less
  }, [status.endDate, now]);

  return (
    <DashboardLayout role={role} user={{ id: userId, name: userName }}>
      <Toast text={toast} onClose={() => setToast("")} />

      <div className="flex items-center justify-between mb-6">
        <img
          src="/images/logo/Asset3.png"
          alt="CureVirtual"
          style={{ width: 120, height: "auto" }}
          onError={(e) => {
            if (typeof PLACEHOLDER_LOGO !== "undefined") e.currentTarget.src = PLACEHOLDER_LOGO;
          }}
        />
        <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-wide">
          Pharmacy Subscription
        </h1>
        <div />
      </div>

      {loading ? (
        <p className="text-[var(--text-soft)]">Loading subscription...</p>
      ) : (
        <>
          {/* STATUS CARD */}
          <div className="grid md:grid-cols-3 gap-5 mb-6">
            <div className="bg-[var(--bg-glass)] rounded-2xl p-6 border border-[var(--border)]">
              <p className="text-sm text-[var(--text-soft)]">Current Status</p>
              <div className="mt-2">
                <Pill value={status.status} />
              </div>
              <div className="mt-4 text-[var(--text-soft)] text-sm space-y-1">
                <p>
                  <strong>Plan:</strong>{" "}
                  {status.plan ? status.plan : "—"}
                </p>
                <p>
                  <strong>Provider:</strong>{" "}
                  {status.provider || "—"}
                </p>
                <p>
                  <strong>Start:</strong>{" "}
                  {status.startDate ? new Date(status.startDate).toLocaleString() : "—"}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {status.endDate ? new Date(status.endDate).toLocaleString() : "—"}
                </p>
              </div>

              {active && expiresSoon && (
                <div className="mt-4 text-amber-300 text-sm flex items-center gap-2">
                  <FaTimesCircle /> Your subscription expires soon — consider renewing.
                </div>
              )}
              {!active && (
                <div className="mt-4 text-blue-200 text-sm flex items-center gap-2">
                  <FaCheckCircle /> Subscribe to unlock all pharmacy features.
                </div>
              )}
            </div>

            {/* MONTHLY CARD */}
            <div className="bg-[var(--bg-glass)] rounded-2xl p-6 border border-[var(--border)]">
              <p className="text-sm text-[var(--text-soft)]">Monthly</p>
              <h2 className="text-3xl font-semibold mt-2 text-[var(--text-main)]">
                {prices.monthlyUsd != null ? `$${prices.monthlyUsd}/mo` : "—"}
              </h2>
              <ul className="mt-4 text-[var(--text-soft)] text-sm list-disc pl-5 space-y-1">
                <li>Full access to prescription dispatch tools</li>
                <li>Priority messaging & support</li>
                <li>Billing every month</li>
              </ul>
              <button
                className="mt-6 w-full bg-[#027906] hover:bg-[#190366] text-[var(--text-main)] py-2 rounded"
                onClick={() => handleSubscribe("MONTHLY")}
              >
                {active && status.plan === "MONTHLY" ? "Renew Monthly" : "Subscribe Monthly"}
              </button>
            </div>

            {/* YEARLY CARD */}
            <div className="bg-[var(--bg-glass)] rounded-2xl p-6 border border-[var(--border)]">
              <p className="text-sm text-[var(--text-soft)]">Yearly</p>
              <h2 className="text-3xl font-semibold mt-2 text-[var(--text-main)]">
                {prices.yearlyUsd != null ? `$${prices.yearlyUsd}/yr` : "—"}
              </h2>
              <ul className="mt-4 text-[var(--text-soft)] text-sm list-disc pl-5 space-y-1">
                <li>All monthly benefits</li>
                <li>Best value for growing pharmacies</li>
                <li>Billed once per year</li>
              </ul>
              <button
                className="mt-6 w-full bg-[#027906] hover:bg-[#190366] text-[var(--text-main)] py-2 rounded"
                onClick={() => handleSubscribe("YEARLY")}
              >
                {active && status.plan === "YEARLY" ? "Renew Yearly" : "Subscribe Yearly"}
              </button>
            </div>
          </div>

          {/* HISTORY TABLE */}
          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[var(--text-main)]">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[var(--text-main)]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="p-3">Date</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length ? (
                    history.map((h) => (
                      <tr key={h.id} className="border-b border-[var(--border)]">
                        <td className="p-3">
                          {h.createdAt ? new Date(h.createdAt).toLocaleString() : "—"}
                        </td>
                        <td className="p-3">{h.plan || "—"}</td>
                        <td className="p-3">
                          <Pill value={h.status} />
                        </td>
                        <td className="p-3">{h.provider || "—"}</td>
                        <td className="p-3">{h.reference || "—"}</td>
                        <td className="p-3">
                          {h.amount != null && h.currency
                            ? `${(h.amount / 100).toFixed(2)} ${h.currency}`
                            : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-6 text-[var(--text-soft)]" colSpan={6}>
                        No subscription history yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
