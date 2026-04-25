// FILE: src/pages/doctor/PatientList.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import { FaEye, FaSearch, FaUser } from 'react-icons/fa';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [viewPatient, setViewPatient] = useState(null);
  const doctorUserId = localStorage.getItem('userId');
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Doctor';
  const role = 'DOCTOR';

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/doctor/my-patients', {
        params: { doctorId: doctorUserId },
      });
      setPatients(res.data || []);
    } catch (err) {
      setError('Failed to load clinical registry.');
    } finally {
      setLoading(false);
    }
  }, [doctorUserId]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q)
    );
  }, [patients, search]);

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-green)] uppercase tracking-[0.3em] mb-1">
              Clinical Registry
            </h2>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">
              Patient Pool
            </h1>
          </div>
          <div className="relative group min-w-[300px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-green)] transition-all" />
            <input
              type="text"
              placeholder="Filter by name or identity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-6 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">
              {error}
            </p>
          </div>
        )}

        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Subject Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Encrypted Identity
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Gender
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Classification
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">
                    Protocol Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center font-bold text-[var(--text-soft)] animate-pulse uppercase tracking-widest text-xs"
                    >
                      Accessing Identity Vault...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center font-bold text-[var(--text-soft)] uppercase tracking-widest text-xs"
                    >
                      No matching subjects found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--bg-main)]/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-black text-[var(--text-main)]">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[var(--text-soft)]">
                        {p.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-[var(--bg-main)]/50 border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--text-soft)]">
                          {p.gender || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black font-mono text-[var(--brand-blue)]">
                          {p.bloodGroup || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={async () => {
                              try {
                                const res = await api.get(
                                  `/doctor/patient/${p.id}`
                                );
                                setViewPatient({ profile: res.data });
                              } catch (e) {
                                setViewPatient(p);
                              }
                            }}
                            className="p-2 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaEye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={() => setViewPatient(null)}
          ></div>
          <div className="relative w-full max-w-2xl glass !p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6 flex items-center gap-3">
              <FaUser className="text-[var(--brand-green)]" /> Subject Profile
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8 border-t border-[var(--border)] pt-8">
              <section className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Full Name
                  </p>
                  <p className="text-sm font-black text-[var(--text-main)]">
                    {viewPatient.profile?.user
                      ? `${viewPatient.profile.user.firstName} ${viewPatient.profile.user.lastName}`
                      : viewPatient.name || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Email Address
                  </p>
                  <p className="text-sm font-black text-[var(--text-main)]">
                    {viewPatient.profile?.user?.email ||
                      viewPatient.email ||
                      '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                      Gender
                    </p>
                    <p className="text-sm font-black text-[var(--text-main)]">
                      {viewPatient.profile?.gender || '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                      Blood Type
                    </p>
                    <p className="text-sm font-black text-[var(--brand-blue)] font-mono">
                      {viewPatient.profile?.bloodGroup || '—'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                      Height
                    </p>
                    <p className="text-sm font-black text-[var(--text-main)]">
                      {viewPatient.profile?.height
                        ? `${viewPatient.profile.height} cm`
                        : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                      Weight
                    </p>
                    <p className="text-sm font-black text-[var(--text-main)]">
                      {viewPatient.profile?.weight
                        ? `${viewPatient.profile.weight} kg`
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Date of Birth
                  </p>
                  <p className="text-sm font-black text-[var(--text-main)]">
                    {viewPatient.profile?.dateOfBirth
                      ? new Date(
                          viewPatient.profile.dateOfBirth
                        ).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Emergency Contact
                  </p>
                  <p className="text-xs font-bold text-[var(--text-soft)]">
                    {viewPatient.profile?.emergencyContact || '—'}
                  </p>
                </div>
              </section>

              <section className="md:col-span-2 space-y-6 pt-6 border-t border-[var(--border)]">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-[var(--brand-orange)] tracking-widest">
                      Known Allergies
                    </p>
                    <div className="bg-[var(--bg-main)]/50 p-4 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--text-soft)] min-h-[60px]">
                      {viewPatient.profile?.allergies || 'No allergies logged.'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-[var(--brand-blue)] tracking-widest">
                      Current Medications
                    </p>
                    <div className="bg-[var(--bg-main)]/50 p-4 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--text-soft)] min-h-[60px]">
                      {viewPatient.profile?.medications ||
                        'No active medications.'}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Medical History
                  </p>
                  <div className="bg-[var(--bg-main)]/50 p-4 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--text-soft)] min-h-[80px]">
                    {viewPatient.profile?.medicalHistory ||
                      'Historical records unavailable.'}
                  </div>
                </div>
              </section>
            </div>
            <button
              onClick={() => setViewPatient(null)}
              className="btn btn-primary w-full shadow-lg"
            >
              Close Protocol
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
