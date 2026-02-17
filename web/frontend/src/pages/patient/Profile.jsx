// FILE: src/pages/patient/Profile.jsx
import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const BLOODS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'];

const PRISMA_TO_PUBLIC_BG = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
  UNKNOWN: 'UNKNOWN',
};
const PUBLIC_TO_PRISMA_BG = {
  'A+': 'A_POSITIVE',
  'A-': 'A_NEGATIVE',
  'B+': 'B_POSITIVE',
  'B-': 'B_NEGATIVE',
  'AB+': 'AB_POSITIVE',
  'AB-': 'AB_NEGATIVE',
  'O+': 'O_POSITIVE',
  'O-': 'O_NEGATIVE',
  UNKNOWN: 'UNKNOWN',
};

const HEIGHT_UNITS = ['cm', 'ft/in'];
const WEIGHT_UNITS = ['kg', 'lbs'];

function normalizeIncomingBloodGroup(value) {
  if (!value) return 'UNKNOWN';
  if (PRISMA_TO_PUBLIC_BG[value]) return PRISMA_TO_PUBLIC_BG[value];
  if (BLOODS.includes(value)) return value;
  return 'UNKNOWN';
}

function toPrismaBloodGroup(uiValue) {
  return PUBLIC_TO_PRISMA_BG[uiValue] || uiValue || 'UNKNOWN';
}

export default function PatientProfile() {
  const role = 'PATIENT';
  const userId = localStorage.getItem('userId') || '';
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Patient';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'OTHER',
    bloodGroup: 'UNKNOWN',
    height: '',
    heightUnit: 'cm', // Default
    weight: '',
    weightUnit: 'kg', // Default
    allergies: '',
    medications: '',
    medicalHistory: '',
    address: '',
    emergencyContact: '',
    emergencyContactName: '',
    emergencyContactEmail: '',
    medicalRecordNumber: '',
    insuranceProvider: '',
    insuranceMemberId: '',
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/patient/profile', { params: { userId } });
      const p = res.data?.data;
      if (p) {
        setForm({
          firstName: p.user?.firstName || '',
          middleName: p.user?.middleName || '',
          lastName: p.user?.lastName || '',
          phone: p.user?.phone || '',
          dateOfBirth: p.dateOfBirth
            ? new Date(p.dateOfBirth).toISOString().slice(0, 10)
            : '',
          gender: p.gender || 'OTHER',
          bloodGroup: normalizeIncomingBloodGroup(p.bloodGroup),
          height: p.height ?? '',
          heightUnit: p.heightUnit || 'cm',
          weight: p.weight ?? '',
          weightUnit: p.weightUnit || 'kg',
          allergies: p.allergies || '',
          medications: p.medications || '',
          medicalHistory: p.medicalHistory || '',
          address: p.address || '',
          emergencyContact: p.emergencyContact || '',
          emergencyContactName: p.emergencyContactName || '',
          emergencyContactEmail: p.emergencyContactEmail || '',
          medicalRecordNumber: p.medicalRecordNumber || '',
          insuranceProvider: p.insuranceProvider || '',
          insuranceMemberId: p.insuranceMemberId || '',
        });
      }
    } catch (err) {
      toast.error('Complete your profile configuration.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadProfile();
  }, [loadProfile, userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        userId,
        ...form,
        bloodGroup: toPrismaBloodGroup(form.bloodGroup),
        height: form.height === '' ? null : Number(form.height),
        heightUnit: form.heightUnit,
        weight: form.weight === '' ? null : Number(form.weight),
        weightUnit: form.weightUnit,
        dateOfBirth: form.dateOfBirth
          ? new Date(form.dateOfBirth).toISOString()
          : null,
      };
      await api.put('/patient/profile', payload);
      toast.success('Identity vault updated.');
      await loadProfile();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-8">
        <div>
          <h2 className="text-[10px] font-black text-[var(--brand-green)] uppercase tracking-[0.3em] mb-1">
            Patient Account
          </h2>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">
            Patient Profile
          </h1>
        </div>

        <div className="card !p-8 max-w-5xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-[var(--brand-green)]/20 border-t-[var(--brand-green)] rounded-full animate-spin"></div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] animate-pulse">
                Loading Profile...
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSave}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            >
              {/* Name Row */}
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                 <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.middleName}
                    onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

               {/* Phone Row */}
               <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
               </div>


              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Gender Specification
                </label>
                <select
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  required
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Blood Classification
                </label>
                <select
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                  value={form.bloodGroup}
                  onChange={(e) =>
                    setForm({ ...form, bloodGroup: e.target.value })
                  }
                  required
                >
                  {BLOODS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Height
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-l-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.height}
                      onChange={(e) =>
                        setForm({ ...form, height: e.target.value })
                      }
                      placeholder={form.heightUnit === 'cm' ? "175" : "5.9"}
                      step="0.01"
                    />
                    <select
                      className="bg-[var(--bg-main)] border border-[var(--border)] border-l-0 rounded-r-2xl px-2 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.heightUnit}
                      onChange={(e) => setForm({ ...form, heightUnit: e.target.value })}
                    >
                      {HEIGHT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Weight
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-l-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.weight}
                      onChange={(e) =>
                        setForm({ ...form, weight: e.target.value })
                      }
                      placeholder={form.weightUnit === 'kg' ? "70" : "154"}
                      step="0.01"
                    />
                    <select
                      className="bg-[var(--bg-main)] border border-[var(--border)] border-l-0 rounded-r-2xl px-2 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.weightUnit}
                      onChange={(e) => setForm({ ...form, weightUnit: e.target.value })}
                    >
                      {WEIGHT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Postal Address
                </label>
                <input
                  type="text"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Street, City, State, Country"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-orange)] ml-1">
                  Known Allergies
                </label>
                <textarea
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-orange)] outline-none h-20"
                  value={form.allergies}
                  onChange={(e) =>
                    setForm({ ...form, allergies: e.target.value })
                  }
                  placeholder="e.g. Penicillin; Peanuts"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-blue)] ml-1">
                  Active Medications
                </label>
                <textarea
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none h-20"
                  value={form.medications}
                  onChange={(e) =>
                    setForm({ ...form, medications: e.target.value })
                  }
                  placeholder="e.g. Metformin 500mg (daily)"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-[var(--brand-green)] uppercase tracking-wider mb-2 mt-4">Emergency Contact</h3>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.emergencyContactName}
                      onChange={(e) =>
                        setForm({ ...form, emergencyContactName: e.target.value })
                      }
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.emergencyContactEmail}
                      onChange={(e) =>
                        setForm({ ...form, emergencyContactEmail: e.target.value })
                      }
                      placeholder="emergency@example.com"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Additional Details (Relation, Phone, etc.)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                      value={form.emergencyContact}
                      onChange={(e) =>
                        setForm({ ...form, emergencyContact: e.target.value })
                      }
                      placeholder="Mother - +1 555-0123"
                    />
                  </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                  value={form.insuranceProvider}
                  onChange={(e) =>
                    setForm({ ...form, insuranceProvider: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Member ID
                </label>
                <input
                  type="text"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                  value={form.insuranceMemberId}
                  onChange={(e) =>
                    setForm({ ...form, insuranceMemberId: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 flex justify-start pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[#027906] hover:bg-[#045d07] px-8 py-3 text-white font-bold tracking-wider uppercase text-xs shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Encrypting...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
