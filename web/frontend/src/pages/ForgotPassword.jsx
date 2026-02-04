// FILE: src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSmartphone } from 'react-icons/fi';
import { FaArrowRight } from 'react-icons/fa';
import api from '../Lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/auth/request-otp-login', { email });
      setOtpSent(true);
      setMessage('A login OTP has been sent to your email. You can use it on the login page.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-main)]">
      <div className="w-full max-w-[500px] glass p-8 md:p-12 rounded-[2rem] border border-[var(--border)] shadow-2xl animate-in fade-in zoom-in-95 duration-700">
        <Link to="/login" className="inline-flex items-center gap-2 mb-8 text-[var(--brand-green)] hover:text-white transition-all group font-black text-[10px] uppercase tracking-[0.2em]">
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Login
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-2">
            Recovery
          </h1>
          <p className="text-[var(--text-soft)] text-sm font-bold opacity-70">
            {otpSent ? 'Check your email for the OTP.' : 'Enter your email to receive a login OTP.'}
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleRequestOTP} className="space-y-6">
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

            {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest px-2">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full !py-4.5 !rounded-2xl text-xs shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70 group"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Send OTP <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
              <p className="text-green-500 text-[10px] font-black uppercase tracking-wider leading-relaxed">
                {message}
              </p>
            </div>
            <Link
              to="/login"
              className="btn btn-primary w-full !py-4.5 !rounded-2xl text-xs shadow-2xl flex items-center justify-center gap-3"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
