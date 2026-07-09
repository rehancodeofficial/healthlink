// FILE: src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../Lib/api";
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const emailForAuth = email.trim().toLowerCase();

      // Login via custom backend
      const res = await api.post("/auth/login", {
        email: emailForAuth,
        password: password,
      });

      handleAuthSuccess(res.data, emailForAuth);
    } catch (err) {
      console.error("Login error:", err);
      
      const responseData = err.response?.data;
      const errorMessage = responseData?.error || err.message || "Login failed. Please try again.";
      
      // Handle unverified user
      if (err.response?.status === 403 && responseData?.unverified) {
        toast.info("Account not verified. Redirecting to verification page...");
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: responseData.email || email } });
        }, 2000);
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (data, userEmail) => {
    const { token } = data;
    const user = data.user;

    localStorage.setItem("token", token);
    localStorage.setItem("userId", user.id);
    localStorage.setItem("name", user.name);
    localStorage.setItem("userName", user.name);
    localStorage.setItem("role", user.role);
    localStorage.setItem("type", user.type || "USER");
    localStorage.setItem("email", user.email || userEmail);

    toast.success("Login successful! Redirecting...");

    setTimeout(() => {
      switch (user.role) {
        case "SUPERADMIN":
          navigate("/superadmin/dashboard");
          break;
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        case "SUPPORT":
          navigate("/support/dashboard");
          break;
        case "DOCTOR":
          navigate("/doctor/dashboard");
          break;
        case "PATIENT":
          navigate("/patient/dashboard");
          break;
        case "PHARMACY":
          navigate("/pharmacy/dashboard");
          break;
        default:
          navigate("/");
      }
    }, 1000);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-[var(--bg-transparent)]`}>
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

      <div className="w-full max-w-[1000px] flex flex-col md:flex-row glass overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-700 rounded-[3rem] border border-[var(--border)]">
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col justify-between w-2/5 p-12 text-[var(--text-main)] relative overflow-hidden bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,var(--brand-orange),transparent)]"></div>
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,var(--brand-green),transparent)]"></div>
          </div>

          <div className="z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-8 md:mb-12 text-[var(--brand-green)] hover:text-white transition-all group font-black text-[10px] uppercase tracking-[0.2em]"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Home
            </Link>

            <div className="mb-8">
              <div className="flex items-center gap-3 bg-[var(--bg-glass)] p-3 rounded-2xl mb-6 border border-[var(--border)] shadow-2xl">
                <img src="/images/logo/Asset3.png" alt="Logo" className="w-10 h-10" />
                <span className="text-xl font-black tracking-tighter text-[var(--text-main)] uppercase">
                  CURE<span className="text-[var(--brand-blue)]">VIRTUAL</span>
                </span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter mb-4 leading-none uppercase text-[var(--brand-green)]">
                Welcome <br /> <span className="text-[var(--brand-green)]">Back</span>
              </h2>
              <p className="text-[var(--brand-green)] text-sm leading-relaxed max-w-xs font-bold uppercase tracking-widest italic">
                Login to your account.
              </p>
            </div>
          </div>

          <div className="z-10 flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-[var(--brand-orange)] animate-ping"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-green)]">
              Secure Login
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-3/5 bg-[var(--bg-card)] p-6 md:p-14 flex flex-col justify-center">
          <div className="mb-8 md:mb-10">
            {/* Mobile Branding */}
            <div className="md:hidden flex items-center gap-2 mb-6 opacity-80">
              <img src="/images/logo/Asset3.png" alt="Logo" className="w-6 h-6" />
              <span className="text-sm font-black tracking-tighter text-[var(--text-main)] uppercase">
                CURE<span className="text-[var(--brand-blue)]">VIRTUAL</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--brand-green)]/20 bg-[var(--brand-green)]/5 text-[var(--brand-green)] text-[9px] font-black uppercase tracking-[0.2em] mb-4">
              <FiLock /> Secure Auth
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-2">
              Login
            </h1>
            <p className="text-[var(--text-soft)] text-sm font-bold opacity-70">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                  placeholder="Email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  title="Recover Password"
                  className="text-[9px] font-black text-[var(--brand-orange)] uppercase tracking-widest hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-green)] transition-all">
                  <FiLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-14 text-sm font-bold focus:border-[var(--brand-green)] outline-none transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors z-10"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 animate-shake">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-wider">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full !py-4.5 !rounded-2xl text-xs shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70 group"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Login
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-[var(--border)]">
            <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-widest">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[var(--brand-blue)] font-black hover:underline cursor-pointer ml-1"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
