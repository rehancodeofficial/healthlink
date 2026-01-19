// FILE: src/pages/Register.jsx
import { useState } from 'react';
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiLock,
  FiArrowLeft,
  FiShield,
  FiSettings,
} from 'react-icons/fi';
import { FaArrowRight, FaStethoscope, FaUserShield } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Lib/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../context/ThemeContext';
import OTPVerification from '../components/OTPVerification';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT',
    specialization: '',
    gender: 'PREFER_NOT_TO_SAY',
    dateOfBirth: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/auth/register', {
        ...form,
        email: String(form.email || '')
          .trim()
          .toLowerCase(),
      });
      
      // Check if email verification is required
      if (response.data.requiresVerification) {
        toast.success('Registration successful! Please check your email for verification code.');
        setRegisteredEmail(form.email.trim().toLowerCase());
        setShowOTP(true);
      } else {
        toast.success('Registration sequence complete.');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerified = () => {
    toast.success('Email verified successfully! You can now log in.');
    setTimeout(() => navigate('/login'), 1500);
  };

  const handleBackFromOTP = () => {
    setShowOTP(false);
    setRegisteredEmail('');
  };

  // Show OTP verification screen if needed
  if (showOTP) {
    return (
      <OTPVerification
        email={registeredEmail}
        onVerified={handleVerified}
        onBack={handleBackFromOTP}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 bg-[var(--bg-main)]`}
    >
      {/* Triple Color Atmospheric Glow */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[var(--brand-orange)] opacity-[0.05] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[var(--brand-green)] opacity-[0.05] blur-[150px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-[var(--brand-blue)] opacity-[0.03] blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[1100px] flex flex-col md:flex-row glass overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 rounded-[3rem] border border-[var(--border)]">
        {/* Left Side: Onboarding Panel */}
        <div className="hidden md:flex flex-col justify-between w-2/5 p-12 text-[var(--text-main)] relative overflow-hidden bg-gradient-to-tr from-[#0f172a] to-[#1e293b]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,var(--brand-blue),transparent)]"></div>
            <div className="absolute bottom-10 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,var(--brand-orange),transparent)]"></div>
          </div>

          <div className="z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-12 text-emerald-300 hover:text-emerald-200 transition-all font-black text-[10px] uppercase tracking-widest group"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <div className="flex items-center gap-3 bg-[var(--bg-glass)] p-3 rounded-2xl mb-8 border border-[var(--border)] shadow-2xl">
              <img
                src="/images/logo/Asset3.png"
                alt="Logo"
                className="w-10 h-10"
              />
              <span className="text-xl font-black tracking-tighter text-[var(--text-main)] uppercase">
                CURE<span className="text-[var(--brand-blue)]">VIRTUAL</span>
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-6 leading-[0.9] uppercase text-emerald-300">
              Create <br />{' '}
              <span className="text-emerald-300">Account</span>
            </h2>
            <p className="text-emerald-300 text-sm leading-relaxed max-w-xs font-bold uppercase tracking-widest italic text-justify">
              Sign up to access virtual care.
            </p>
          </div>

          <div className="z-10 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-[var(--bg-glass)] border border-[var(--border)] backdrop-blur-xl">
              <div className="h-10 w-10 rounded-2xl bg-[var(--brand-green)]/20 flex items-center justify-center text-[var(--brand-green)]">
                <FiShield className="text-xl" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">
                  Secure Data
                </p>
                <p className="text-[9px] font-bold text-[var(--text-main)]/40 uppercase tracking-widest">
                  Medical Grade Security
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Deployment Form */}
        <div className="w-full md:w-3/5 bg-[var(--bg-card)] p-8 md:p-14 flex flex-col overflow-y-auto max-h-[90vh]">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-2">
              Create{' '}
              <span className="text-[var(--brand-green)]">Account</span>
            </h1>
            <p className="text-[var(--text-soft)] text-sm font-bold opacity-70">
              Fill in your details to get started.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                  First Name
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none transition-all shadow-inner"
                  placeholder="First"
                  required
                />
              </div>
               <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                  Middle Name
                </label>
                <input
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none transition-all shadow-inner"
                  placeholder="(Opt)"
                />
              </div>
               <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none transition-all shadow-inner"
                  placeholder="Last"
                  required
                />
              </div>
            </div>

             <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                        Date of Birth
                    </label>
                     <input
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none transition-all shadow-inner"
                        required
                    />
                </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                        Gender
                    </label>
                    <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none transition-all shadow-inner appearance-none"
                    >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                </div>
             </div>


            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-green)] transition-all">
                  <FiMail />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none transition-all shadow-inner"
                  placeholder="address@meta"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-green)] transition-all">
                    <FiLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 pl-12 pr-12 text-xs font-bold focus:border-[var(--brand-green)] outline-none transition-all shadow-inner"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-green)] transition-all">
                    <FiLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none transition-all shadow-inner"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                I am a...
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: 'PATIENT',
                    label: 'PATIENT',
                    color: 'var(--brand-orange)',
                  },
                  {
                    id: 'DOCTOR',
                    label: 'DOCTOR',
                    color: 'var(--brand-green)',
                  },
                  {
                    id: 'PHARMACY',
                    label: 'PHARMACIST',
                    color: 'var(--brand-blue)',
                  },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: role.id }))}
                    className={`py-3 rounded-2xl border-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                      form.role === role.id
                        ? `bg-white text-black shadow-xl`
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-main)]'
                    }`}
                    style={
                      form.role === role.id ? { borderColor: role.color } : {}
                    }
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {form.role === 'DOCTOR' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                  Medical Specialization
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--brand-green)]">
                    <FaStethoscope />
                  </div>
                  <select
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg-main)] border border-[var(--brand-green)]/30 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none transition-all shadow-inner appearance-none"
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Dentistry">Dentistry</option>
                    <option value="ENT">ENT</option>
                    <option value="Urology">Urology</option>
                    <option value="Oncology">Oncology</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-secondary w-full !py-4.5 !rounded-2xl text-xs flex items-center justify-center gap-3 shadow-2xl disabled:opacity-70 mt-4 group"
            >
              {submitting ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Submit{' '}
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-8 text-center border-t border-[var(--border)] pt-8">
            <p className="text-xs font-bold text-[var(--text-soft)] uppercase tracking-widest">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[var(--brand-orange)] font-black hover:underline ml-1"
              >
                Login
              </Link>
            </p>
          </footer>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}
