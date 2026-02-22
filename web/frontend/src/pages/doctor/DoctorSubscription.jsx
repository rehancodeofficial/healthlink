import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import api from "../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const PLACEHOLDER_LOGO = "/images/logo/Asset3.png";

const fmtUSD = (n) => (typeof n === "number" && !Number.isNaN(n) ? `$${n.toFixed(2)}` : "—");

export default function DoctorSubscription() {
  const role = "DOCTOR";
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Doctor";

  const [prices, setPrices] = useState({ monthlyUsd: null, yearlyUsd: null });
  const [status, setStatus] = useState({
    status: "NONE",
    startDate: null,
    endDate: null,
    plan: null,
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [plan, setPlan] = useState("MONTHLY"); // MONTHLY | YEARLY

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, sRes, hRes] = await Promise.all([
        api.get("/subscription/prices"),
        api.get("/subscription/status", { params: { userId } }),
        api.get("/subscription", { params: { userId } }),
      ]);

      const pr = pRes.data?.data || {};
      setPrices({
        monthlyUsd: pr.doctorMonthlyUsd ?? null,
        yearlyUsd: pr.doctorYearlyUsd ?? null,
      });
      setStatus(sRes.data?.data || { status: "NONE" });
      setHistory(hRes.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubscribe = async () => {
    try {
      if (!userId) {
        toast.error("No user id found.");
        return;
      }
      if (plan === "MONTHLY" && !prices.monthlyUsd) {
        toast.error("Monthly price is not configured.");
        return;
      }
      if (plan === "YEARLY" && !prices.yearlyUsd) {
        toast.error("Yearly price is not configured.");
        return;
      }

      setProcessing(true);

      // Stripe checkout for Doctor
      const res = await api.post("/subscription/stripe/checkout", {
        userId,
        plan, // "MONTHLY" | "YEARLY"
      });

      const url = res?.data?.url;
      if (!url) throw new Error("Checkout URL not returned from server");

      window.location.href = url; // redirect to Stripe
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.message || "Failed to start checkout";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const statusColor =
    status.status === "ACTIVE"
      ? "text-green-400"
      : status.status === "EXPIRED"
        ? "text-yellow-400"
        : status.status === "DEACTIVATED"
          ? "text-red-400"
          : "text-gray-300";

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />

        <div className="p-6 space-y-6">
          <img
            src="/images/logo/Asset3.png"
            alt="CureVirtual"
            style={{ width: 120, height: "auto" }}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_LOGO;
            }}
          />
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Subscription</h1>

          {/* Status card */}
            <div className="flex items-center justify-between flex-col md:flex-row gap-4">
              <div className="w-full">
                <div className="text-sm text-[var(--text-soft)]">Current Status</div>
                <div className={`text-2xl font-semibold ${statusColor}`}>{status.status}</div>
                {status.startDate && (
                  <div className="text-[var(--text-muted)] text-sm mt-1">
                    {status.plan} • {new Date(status.startDate).toLocaleDateString()} →{" "}
                    {new Date(status.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
              {/* Pick plan & subscribe */}

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    value="MONTHLY"
                    checked={plan === "MONTHLY"}
                    onChange={() => setPlan("MONTHLY")}
                  />
                  <span>Monthly — {fmtUSD(Number(prices.monthlyUsd || 0))}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    value="YEARLY"
                    checked={plan === "YEARLY"}
                    onChange={() => setPlan("YEARLY")}
                  />
                  <span>Yearly — {fmtUSD(Number(prices.yearlyUsd || 0))}</span>
                </label>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={processing}
                className="rounded bg-[#027906] hover:bg-[#190366] px-5 py-2 font-semibold disabled:opacity-60"
              >
                {processing ? "Processing..." : "Subscribe / Renew"}
              </button>
            
          

          {/* History */}
          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">History</h2>
            {loading ? (
              <p className="text-[var(--text-soft)]">Loading...</p>
            ) : history.length === 0 ? (
              <p className="text-[var(--text-muted)]">No subscriptions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--text-soft)] uppercase text-sm">
                      <th className="p-3">Reference</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Period</th>
                      <th className="p-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((s) => {
                      const comp = s.computedStatus || s.status;
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-[var(--border)] hover:bg-[var(--bg-glass)] transition"
                        >
                          <td className="p-3">{s.reference || "—"}</td>
                          <td className="p-3">{s.plan}</td>
                          <td className="p-3">
                            {s.amount ? `$${(s.amount / 100).toFixed(2)}` : "—"}
                          </td>
                          <td className="p-3">
                            {comp === "ACTIVE" ? (
                              <span className="flex items-center gap-2 text-green-400">
                                <FaCheckCircle /> Active
                              </span>
                            ) : comp === "PENDING" ? (
                              <span className="text-yellow-400">Pending</span>
                            ) : comp === "DEACTIVATED" ? (
                              <span className="flex items-center gap-2 text-red-400">
                                <FaTimesCircle /> Deactivated
                              </span>
                            ) : comp === "EXPIRED" ? (
                              <span className="text-[var(--text-soft)]">Expired</span>
                            ) : (
                              <span className="text-[var(--text-soft)]">{comp}</span>
                            )}
                          </td>
                          <td className="p-3">
                            {s.startDate && s.endDate
                              ? `${new Date(s.startDate).toLocaleDateString()} → ${new Date(
                                  s.endDate
                                ).toLocaleDateString()}`
                              : "—"}
                          </td>
                          <td className="p-3">{new Date(s.createdAt).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
