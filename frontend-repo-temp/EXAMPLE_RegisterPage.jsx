// EXAMPLE: Complete Registration Page with OTP Verification
// FILE: frontend/src/pages/RegisterPage.jsx (EXAMPLE - DO NOT OVERWRITE EXISTING)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import OTPVerification from "../components/OTPVerification";
import "./RegisterPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://curevirtual-2-production-ee33.up.railway.app/api";

const RegisterPage = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "PATIENT",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle registration submission
  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      toast.success(response.data.message);

      // If email verification is required
      if (response.data.requiresVerification) {
        setRegisteredEmail(formData.email);
        setShowOTP(true);
      } else {
        // Redirect to login if no verification needed
        navigate("/login");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Registration failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle successful OTP verification
  const handleVerified = () => {
    toast.success("Email verified successfully! You can now log in.");
    navigate("/login");
  };

  // Handle back from OTP screen
  const handleBackFromOTP = () => {
    setShowOTP(false);
  };

  // Show OTP verification screen
  if (showOTP) {
    return (
      <OTPVerification
        email={registeredEmail}
        onVerified={handleVerified}
        onBack={handleBackFromOTP}
      />
    );
  }

  // Show registration form
  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>
        <p className="register-subtitle">Join CureVirtual today</p>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">I am a...</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="PHARMACY">Pharmacy</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
