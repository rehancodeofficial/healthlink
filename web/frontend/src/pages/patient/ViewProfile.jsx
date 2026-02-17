// FILE: src/pages/patient/ViewProfile.jsx
import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import { ToastContainer, toast } from 'react-toastify';
import EditProfileModal from './EditProfileModal';
import 'react-toastify/dist/ReactToastify.css';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function humanBlood(b) {
  if (!b) return '—';
  return b.replace('_POS', '+').replace('_NEG', '-');
}

function humanGender(g) {
  if (!g) return '—';
  const map = { MALE: 'Male', FEMALE: 'Female', OTHER: 'Other' };
  return map[g] || g;
}

function getInitials(name) {
  if (!name) return 'P';
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts[1]?.[0] || '';
  return (first + last).toUpperCase() || 'P';
}

export default function PatientViewProfile() {
  const role = 'PATIENT';
  const userId = localStorage.getItem('userId') || '';
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Patient';

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/patient/profile', { params: { userId } });
      setProfile(res.data?.data || null);
    } catch (err) {
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadProfile();
  }, [loadProfile, userId]);

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-green)] uppercase tracking-[0.3em] mb-1">
              Medical Identity
            </h2>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">
              View Profile
            </h1>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-primary"
          >
            Update Profile
          </button>
        </div>

        <div className="card !p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-[var(--brand-green)]/20 border-t-[var(--brand-green)] rounded-full animate-spin"></div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] animate-pulse">
                Decrypting Records...
              </p>
            </div>
          ) : !profile ? (
            <p className="text-[var(--text-soft)]">No profile found.</p>
          ) : (
            <>
              {/* Header strip with avatar + basic info */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[var(--border)] pb-8 mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-[var(--brand-green)] to-[var(--brand-blue)] flex items-center justify-center text-3xl font-black text-[var(--text-main)] shadow-xl">
                    {getInitials(userName)}
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[var(--text-main)] tracking-tight">
                      {userName}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-blue)] mt-1">
                      MRN Protocol: {profile.medicalRecordNumber || 'OFFLINE'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                      Created
                    </div>
                    <div className="text-sm font-bold text-[var(--text-main)]">
                      {formatDate(profile.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                      Last Sync
                    </div>
                    <div className="text-sm font-bold text-[var(--text-main)]">
                      {formatDate(profile.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">
                    Personal Specification
                  </h2>
                  <div className="bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-3xl p-6 space-y-4">
                    {[
                      {
                        label: 'Date of Birth',
                        value: formatDate(profile.user?.dateOfBirth || profile.dateOfBirth),
                      },
                      { label: 'Gender', value: humanGender(profile.user?.gender || profile.gender) },
                      {
                        label: 'Blood Group',
                        value: humanBlood(profile.bloodGroup),
                      },
                      {
                        label: 'Height',
                        value: profile.height ? `${profile.height} cm` : '—',
                      },
                      {
                        label: 'Weight',
                        value: profile.weight ? `${profile.weight} kg` : '—',
                      },
                      { label: 'Address', value: profile.address || '—' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start gap-4"
                      >
                        <dt className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">
                          {item.label}
                        </dt>
                        <dd className="text-sm font-bold text-[var(--text-main)] text-right">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-blue)] ml-1">
                    System Identifiers
                  </h2>
                  <div className="bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-3xl p-6 space-y-4">
                    {[
                      {
                        label: 'Medical Record Number',
                        value: profile.medicalRecordNumber || '—',
                      },
                      {
                        label: 'Insurance Provider',
                        value: profile.insuranceProvider || '—',
                      },
                      {
                        label: 'Member ID',
                        value: profile.insuranceMemberId || '—',
                      },
                      {
                        label: 'Emergency Protocol',
                        value: profile.emergencyContact || '—',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-start gap-4"
                      >
                        <dt className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">
                          {item.label}
                        </dt>
                        <dd className="text-sm font-bold text-[var(--text-main)] text-right">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="md:col-span-2 space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-orange)] ml-1 mb-4">
                    Clinical Observations
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        label: 'Allergies',
                        value: profile.allergies,
                        color: 'orange',
                      },
                      {
                        label: 'Active Medications',
                        value: profile.medications,
                        color: 'blue',
                      },
                      {
                        label: 'Medical History',
                        value: profile.medicalHistory,
                        color: 'green',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`bg-[var(--bg-main)]/50 border border-[var(--border)] rounded-3xl p-6 border-t-4 border-t-[var(--brand-${item.color})]`}
                      >
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                          {item.label}
                        </p>
                        <p className="text-sm font-bold text-[var(--text-main)] whitespace-pre-wrap leading-relaxed">
                          {item.value?.trim()
                            ? item.value
                            : 'No critical data logged.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        profile={profile} 
        onProfileUpdate={handleProfileUpdate}
      />
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
