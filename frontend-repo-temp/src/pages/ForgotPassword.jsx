// FILE: src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiArrowLeft, FiSmartphone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";
import { supabase } from "../Lib/supabase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Request Password Reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;

      toast.success("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: "recovery",
      });
      if (error) throw error;

      toast.success("OTP verified. Please set a new password.");
      setStep(3);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Update Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      toast.success("Password updated successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-main)]">
      <div className="w-full max-w-[500px] glass p-8 md:p-12 rounded-[2rem] border border-[var(--border)] shadow-2xl animate-in fade-in zoom-in-95 duration-700">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 mb-8 text-[var(--brand-green)] hover:text-white transition-all group font-black text-[10px] uppercase tracking-[0.2em]"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Login
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-2">
            {step === 1 && "Recovery"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "New Password"}
          </h1>
          <p className="text-[var(--text-soft)] text-sm font-bold opacity-70">
            {step === 1 && "Enter your email to receive a recovery OTP."}
            {step === 2 && `Enter the OTP sent to ${email}`}
            {step === 3 && "Create a secure new password."}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-green)] transition-all">
                  <FiMail />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-[var(--brand-blue)] outline-none transition-all shadow-inner"
                  placeholder="your@email.com"
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
                  Send OTP{" "}
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                Enter OTP
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-green)] transition-all">
                  <FiSmartphone />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-[var(--brand-green)] outline-none transition-all shadow-inner"
                  placeholder="123456"
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
                  Verify & Continue{" "}
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[var(--text-soft)] hover:text-[var(--brand-orange)] font-bold transition-colors"
              >
                Wrong email? Go back
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-green)] transition-all">
                  <FiLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-12 text-sm font-bold focus:border-[var(--brand-green)] outline-none transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-green)] transition-all">
                  <FiLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-12 text-sm font-bold focus:border-[var(--brand-green)] outline-none transition-all shadow-inner"
                  placeholder="••••••••"
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
                  Reset Password{" "}
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
