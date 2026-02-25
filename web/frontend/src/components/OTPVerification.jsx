// FILE: frontend/src/components/OTPVerification.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./OTPVerification.css";

const API_BASE_URL = import.meta.env.DEV
  ? "https://curevirtual-2-production-ee33.up.railway.app/api"
  : import.meta.env.VITE_API_BASE_URL || "https://curevirtual-2-production-ee33.up.railway.app/api";

const OTPVerification = ({ email, onVerified, onBack }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      document.getElementById("otp-5")?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/otp/verify`, {
        email,
        otp: otpValue,
      });

      toast.success(response.data.message || "Email verified successfully!");

      if (onVerified) {
        onVerified();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Verification failed";
      toast.error(errorMsg);

      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/otp/resend`, {
        email,
      });

      toast.success(response.data.message || "OTP sent successfully!");
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to resend OTP";
      toast.error(errorMsg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-verification-container">
      <div className="otp-verification-card">
        <div className="otp-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <h2>Verify Your Email</h2>
        <p className="otp-description">
          We've sent a 6-digit verification code to
          <br />
          <strong>{email}</strong>
        </p>

        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-input"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {!canResend && timeLeft > 0 && (
          <p className="otp-timer">
            Code expires in <strong>{formatTime(timeLeft)}</strong>
          </p>
        )}

        {canResend && <p className="otp-expired">Code has expired. Please request a new one.</p>}

        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 6}
          className="btn-verify"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <div className="otp-actions">
          <button onClick={handleResend} disabled={resending || !canResend} className="btn-resend">
            {resending ? "Sending..." : "Resend Code"}
          </button>

          {onBack && (
            <button onClick={onBack} className="btn-back">
              Back to Registration
            </button>
          )}
        </div>

        <p className="otp-help">
          Didn't receive the code? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;
