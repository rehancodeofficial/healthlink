// FILE: src/pages/superadmin/Settings.jsx
import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { fetchSettings, updateSettings } from '../../Lib/api';
import {
  FaCogs,
  FaSave,
  FaPalette,
  FaGlobe,
  FaMoneyBillWave,
  FaShieldAlt,
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Settings() {
  const [settings, setSettings] = useState({
    systemName: '',
    themeColor: '',
    logoUrl: '',
    defaultFee: '',
    monthlyPlan: '',
    yearlyPlan: '',
  });
  const [loading, setLoading] = useState(true);

  const user = {
    id: localStorage.getItem('userId'),
    name:
      localStorage.getItem('userName') ||
      localStorage.getItem('name') ||
      'Super Admin',
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSettings();
        setSettings(data || {});
      } catch (err) {
        toast.error(
          'Telemetry Sync Error: Failed to retrieve system parameters.'
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(settings);
      toast.success('System Parameters Synchronized.');
    } catch (err) {
      toast.error('Synchronization Protocol Failed.');
    }
  };

  return (
    <DashboardLayout role="SUPERADMIN" user={user}>
      <div className="space-y-10 animate-in fade-in duration-700">
        <div>
          <h2 className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-[0.4em] mb-1">
            Core Configuration
          </h2>
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-4">
            <FaCogs className="text-[var(--brand-orange)]" /> System Protocol
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Section 1: Visual Identity */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card glass relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                <FaGlobe size={120} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)] mb-8 flex items-center gap-2">
                <FaShieldAlt className="text-[var(--brand-blue)]" /> Ecosystem
                Branding
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] ml-1">
                    System Identifier
                  </label>
                  <input
                    type="text"
                    name="systemName"
                    value={settings.systemName || ''}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-sm font-bold text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none transition-all"
                    placeholder="e.g. CureVirtual Corp"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] ml-1">
                    Logo Uplink (URL)
                  </label>
                  <input
                    type="text"
                    name="logoUrl"
                    value={settings.logoUrl || ''}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-sm font-bold text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-[var(--bg-glass)] border border-[var(--border)] shadow-inner overflow-hidden">
                    <input
                      type="color"
                      name="themeColor"
                      value={settings.themeColor || '#027906'}
                      onChange={handleChange}
                      className="w-[150%] h-[150%] cursor-pointer border-none p-0 bg-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">
                      Primary Spectral Variable
                    </p>
                    <p className="text-xs font-bold text-[var(--text-muted)]">
                      {settings.themeColor || '#027906'}
                    </p>
                  </div>
                  <FaPalette
                    size={18}
                    className="text-[var(--text-muted)] opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Monetary Calibration */}
            <div className="card glass relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                <FaMoneyBillWave size={120} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)] mb-8 flex items-center gap-2">
                <FaMoneyBillWave className="text-[var(--brand-green)]" />{' '}
                Resource Allocation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] ml-1">
                    Default Protocol Fee ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="defaultFee"
                    value={settings.defaultFee || ''}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-sm font-black text-[var(--text-main)] focus:border-[var(--brand-green)] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)] ml-1">
                      Monthly Sync
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="monthlyPlan"
                      value={settings.monthlyPlan || ''}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-sm font-black text-[var(--text-main)] focus:border-[var(--brand-green)] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)] ml-1">
                      Yearly Sync
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="yearlyPlan"
                      value={settings.yearlyPlan || ''}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-sm font-black text-[var(--text-main)] focus:border-[var(--brand-green)] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Hub */}
          <div className="space-y-8">
            <div className="card !bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] text-[var(--text-main)] !p-8 border border-[var(--border)] shadow-2xl">
              <h3 className="text-lg font-black tracking-tighter uppercase mb-2">
                Protocol Command
              </h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed mb-10">
                Warning: Synchronization affects global system parameters.
                Ensure all calibration data is verified before transmission.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pb-3 border-b border-[var(--border)]">
                  <span className="opacity-50">Current Master</span>
                  <span className="text-[var(--brand-blue)]">AUTHORIZED</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pb-3 border-b border-[var(--border)]">
                  <span className="opacity-50">Link Status</span>
                  <span className="text-[var(--brand-green)]">SECURE_LINK</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full py-5 shadow-xl shadow-[var(--brand-blue)]/20 flex items-center justify-center gap-3"
              >
                <FaSave /> Commit Parameters
              </button>
            </div>

            <div className="card glass border border-[var(--border)] !p-8">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
                Preview Visualization
              </h4>
              <div className="h-32 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-main)] flex items-center justify-center overflow-hidden">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Preview"
                    className="h-12 w-auto object-contain"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                ) : (
                  <span className="text-xl font-black text-[var(--text-soft)] tracking-tighter uppercase">
                    No Identity Loaded
                  </span>
                )}
              </div>
              <p className="text-center mt-4 text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest">
                {settings.systemName || 'VOID_ID'}
              </p>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
