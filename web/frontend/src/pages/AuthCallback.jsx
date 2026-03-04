import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Lib/supabase";
import api from "../Lib/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get session from URL hash (Supabase redirects with #access_token)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          setStatus("error");
          toast.error("No session found. Please try logging in.");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        console.log("✅ Email verified. Syncing with backend...");

        // Sync with backend
        const response = await api.post("/auth/register-success", {
          supabaseId: session.user.id,
          email: session.user.email,
          firstName: session.user.user_metadata?.firstName || "User",
          lastName: session.user.user_metadata?.lastName || "User",
          role: session.user.user_metadata?.role || "PATIENT",
          dateOfBirth: session.user.user_metadata?.dateOfBirth,
          gender: session.user.user_metadata?.gender,
          specialization: session.user.user_metadata?.specialization,
        });

        // Store tokens and user data
        const backendToken = response.data.token;
        const user = response.data.user;

        localStorage.setItem("token", backendToken);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("email", user.email);
        localStorage.setItem("name", `${user.firstName} ${user.lastName}`.trim());
        localStorage.setItem("userName", `${user.firstName} ${user.lastName}`.trim());
        localStorage.setItem("role", user.role);
        localStorage.setItem("type", "USER");

        setStatus("success");
        toast.success("Email verified! Redirecting to your dashboard...");

        setTimeout(() => {
          const role = user.role.toLowerCase();
          navigate(`/${role}/dashboard`);
        }, 1500);
      } catch (err) {
        console.error("Email verification error:", err);
        setStatus("error");
        toast.error(err.response?.data?.error || err.message || "Verification failed");
      }
    };

    handleEmailVerification();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
      <div className="text-center p-8">
        {status === "verifying" && (
          <>
            <div className="animate-spin h-16 w-16 border-4 border-[var(--brand-green)] border-t-transparent rounded-full mx-auto mb-6" />
            <p className="text-2xl font-bold text-[var(--text-main)]">Verifying your email...</p>
            <p className="text-sm text-[var(--text-soft)] mt-2">
              Please wait while we complete your registration
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-7xl mb-6">✅</div>
            <p className="text-2xl font-bold text-[var(--brand-green)]">
              Email verified successfully!
            </p>
            <p className="text-sm text-[var(--text-soft)] mt-2">Redirecting to your dashboard...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-7xl mb-6">❌</div>
            <p className="text-2xl font-bold text-red-500">Verification failed</p>
            <p className="text-sm text-[var(--text-soft)] mt-4">
              Please try registering again or contact support.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="mt-6 px-6 py-3 bg-[var(--brand-green)] text-white rounded-2xl font-bold hover:opacity-90 transition-opacity"
            >
              Back to Register
            </button>
          </>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
