import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../Lib/api";
import { FiSmartphone, FiArrowLeft, FiMail, FiRefreshCw } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      toast.error("No email provided for verification.");
      navigate("/login");
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP.");
    }

    setIsLoading(true);
    try {
      const res = await api.post("/otp/verify", { email, otp });
      toast.success(res.data.message || "Email verified! You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(err.response?.data?.error || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      await api.post("/otp/resend", { email });
      toast.success("A new OTP has been sent to your email.");
      setCountdown(60); // 60s cooldown
    } catch (err) {
      console.error("Resend error:", err);
      toast.error(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-transparent)]">
      {/* Dynamic Triple Color Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-[var(--brand-green)] opacity-[0.07] blur-[120px] rounded-full animate-pulse"></div>
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-[var(--brand-blue)] opacity-[0.07] blur-[120px] rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[var(--brand-orange)] opacity-[0.05] blur-[120px] rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-[500px] glass overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-700 rounded-[3rem] border border-[var(--border)]">
        <div className="bg-[var(--bg-card)] p-8 md:p-12">
          <div className="mb-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 mb-6 text-[var(--brand-green)] hover:text-white transition-all group font-black text-[10px] uppercase tracking-[0.2em]"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Login
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--brand-blue)]/20 bg-[var(--brand-blue)]/5 text-[var(--brand-blue)] text-[9px] font-black uppercase tracking-[0.2em] mb-4">
              <FiSmartphone /> Verification Required
            </div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-2">
              Verify Email
            </h1>
            <p className="text-[var(--text-soft)] text-sm font-bold opacity-70">
              We've sent a 6-digit code to <span className="text-[var(--brand-green)]">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                Verification Code
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-green)] transition-all">
                  <FiSmartphone />
                </div>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-6 text-2xl font-black tracking-[0.5em] focus:border-[var(--brand-blue)] outline-none transition-all shadow-inner text-center"
                  placeholder="000000"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full !py-4.5 !rounded-2xl text-xs shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70 group"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Verify Account
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || resendLoading}
                className="inline-flex items-center gap-2 text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-widest hover:underline disabled:opacity-50"
              >
                {resendLoading ? (
                  <FiRefreshCw className="animate-spin" />
                ) : (
                  <FiRefreshCw />
                )}
                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend Verification Code"}
              </button>
            </div>
          </form>

          <footer className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-relaxed">
              Didn't receive the email? <br />
              Check your <span className="text-[var(--brand-orange)]">spam folder</span> or try resending.
            </p>
          </footer>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
