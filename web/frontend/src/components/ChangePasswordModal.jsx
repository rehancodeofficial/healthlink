import { useState } from "react";
import { FiLock, FiX, FiCheck } from "react-icons/fi";
import api from "../Lib/api";
import { toast } from "react-toastify";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/change-password", { newPassword });
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(err.response?.data?.error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md glass border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-[0.3em] mb-1">
                Security Protocol
              </h2>
              <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase">
                Change Password
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-[var(--text-muted)]"
            >
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-orange)] transition-all">
                  <FiLock />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-[var(--brand-orange)] outline-none transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">
                Confirm New Password
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-orange)] transition-all">
                  <FiLock />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-[var(--brand-orange)] outline-none transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] border border-[var(--border)] hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 btn btn-primary flex-1 !p-0 !rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50"
                style={{ background: "var(--brand-orange)" }}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-widest">Update</span>
                    <FiCheck className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
