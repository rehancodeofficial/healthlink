// FILE: src/pages/patient/pharmacy/MyPharmacy.jsx
import { useEffect, useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import api from '../../../Lib/api';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaTrash, FaStar, FaRegStar } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

export default function MyPharmacy() {
  const role = 'PATIENT';
  const patientId = localStorage.getItem('userId') || '';
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Patient';

  const [items, setItems] = useState([]);
  const [view, setView] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/pharmacy/patient/selected', {
        params: { patientId },
      });
      setItems(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load preferred terminals.');
    }
  };

  useEffect(() => {
    if (patientId) load();
  }, [patientId]);

  const removeMap = async (mapId) => {
    try {
      await api.delete(`/pharmacy/patient/select/${mapId}`);
      toast.success('Terminal unlinked.');
      await load();
    } catch (err) {
      toast.error('Failed to unlink terminal.');
    }
  };

  const togglePreferred = async (mapId, next) => {
    try {
      await api.patch(`/pharmacy/patient/select/${mapId}/preferred`, {
        preferred: next,
      });
      toast.success(next ? 'Prioritized' : 'Deprioritized');
      await load();
    } catch (err) {
      toast.error('Failed to update terminal priority.');
    }
  };

  const openView = async (pharmacyId) => {
    try {
      const res = await api.get(`/pharmacy/${pharmacyId}/profile`);
      setView(res.data?.data || null);
    } catch (err) {
      toast.error('Failed to load terminal identity.');
    }
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-8">
        <div>
          <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.3em] mb-1">
            Identity Vault
          </h2>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">
            My Preferred Pharmacies
          </h1>
        </div>

        <div className="card !p-0 overflow-hidden text-[var(--text-main)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Terminal ID
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Location
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">
                    Protocol Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)]"
                    >
                      No terminals linked to your identity.
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr
                      key={r.mapId}
                      className="hover:bg-[var(--bg-main)]/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePreferred(r.mapId, !r.preferred)}
                          className={
                            r.preferred
                              ? 'text-[var(--brand-orange)]'
                              : 'text-[var(--text-muted)] hover:text-[var(--brand-orange)] transition-colors'
                          }
                        >
                          {r.preferred ? (
                            <FaStar size={18} />
                          ) : (
                            <FaRegStar size={18} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-[var(--text-main)]">
                        {r.name}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[var(--text-soft)]">
                        {r.address || 'Zone Unlisted'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => openView(r.pharmacyId)}
                            className="p-2 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => removeMap(r.mapId)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[var(--text-main)] transition-all"
                          >
                            <FaTrash size={14} />
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

      {view && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
             onClick={() => setView(null)}
          ></div>
          <div className="relative w-full max-w-xl glass !p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6">
              {view.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs font-bold text-[var(--text-soft)]">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Email Identity
                  </p>
                  <p className="text-[var(--text-main)]">{view.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Protocol Phone
                  </p>
                  <p className="text-[var(--text-main)]">
                    {view.pharmacyProfile?.phone || '—'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Fulfillment Zone
                  </p>
                  <p className="text-[var(--text-main)]">
                    {view.pharmacyProfile?.address || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Delivery Ops
                  </p>
                  <p
                    className={
                      view.pharmacyProfile?.deliveryAvailable
                        ? 'text-[var(--brand-green)]'
                        : 'text-[var(--brand-orange)]'
                    }
                  >
                    {view.pharmacyProfile?.deliveryAvailable
                      ? 'SYSTEM ACTIVE'
                      : 'OFFLINE'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setView(null)}
              className="btn btn-primary w-full"
            >
              Acknowledged
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
