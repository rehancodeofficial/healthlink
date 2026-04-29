// FILE: src/pages/patient/pharmacy/PharmacyList.jsx
import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import api from '../../../Lib/api';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

function haversineKm(lat1, lon1, lat2, lon2) {
  if (
    [lat1, lon1, lat2, lon2].some((v) => v == null || Number.isNaN(Number(v)))
  )
    return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function PharmacyList() {
  const role = 'PATIENT';
  const patientId = localStorage.getItem('userId') || '';
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Patient';

  const [items, setItems] = useState([]);
  const [myLat, setMyLat] = useState(null);
  const [myLng, setMyLng] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyLat(pos.coords.latitude);
          setMyLng(pos.coords.longitude);
        },
        null,
        { enableHighAccuracy: true, maximumAge: 300000, timeout: 8000 }
      );
    }
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (myLat != null && myLng != null) {
        params.lat = myLat;
        params.lng = myLng;
      }
      const res = await api.get('/pharmacy/list', { params });
      setItems(res.data?.data?.items || []);
    } catch (err) {
      toast.error('Failed to load clinical terminals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [myLat, myLng]);

  const withDistance = useMemo(() => {
    if (myLat == null || myLng == null) return items;
    return items.map((p) => ({
      ...p,
      distanceKm:
        p.latitude != null && p.longitude != null
          ? haversineKm(myLat, myLng, p.latitude, p.longitude)
          : null,
    }));
  }, [items, myLat, myLng]);

  const openView = async (pharmacyId) => {
    try {
      const res = await api.get(`/pharmacy/${pharmacyId}/profile`);
      setActive(res.data?.data || null);
      setModalOpen(true);
    } catch (err) {
      toast.error('Failed to decrypt pharmacy identity.');
    }
  };

  const addToMyPharmacies = async (pharmacyId) => {
    try {
      await api.post('/pharmacy/patient/select', { patientId, pharmacyId });
      toast.success('Pharmacy linked to your profile.');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to add pharmacy.');
    }
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-8">
        <div>
          <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.3em] mb-1">
            Fulfillment Network
          </h2>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">
            Clinic Terminals
          </h1>
        </div>

        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Terminal Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Operations Zone
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Proximity
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">
                    Fulfillment Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)]"
                    >
                      Scanning local grid...
                    </td>
                  </tr>
                ) : withDistance.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)]"
                    >
                      No local terminals active.
                    </td>
                  </tr>
                ) : (
                  withDistance.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--bg-main)]/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-black text-[var(--text-main)]">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[var(--text-soft)]">
                        {p.address || 'Zone Unlisted'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--brand-blue)]">
                          <FaMapMarkerAlt className="text-[var(--brand-orange)]" />
                          {p.distanceKm != null ? `${p.distanceKm} KM` : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => openView(p.id)}
                            className="p-2 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => addToMyPharmacies(p.id)}
                            className="btn btn-primary !py-2 !px-4 !text-[9px]"
                          >
                            <FaPlus /> Preferred
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

      {modalOpen && active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[var(--bg-main)]/80 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-xl glass !p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6">
              {active.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs font-bold text-[var(--text-soft)]">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Email Identity
                  </p>
                  <p className="text-[var(--text-main)]">{active.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Protocol Phone
                  </p>
                  <p className="text-[var(--text-main)]">
                    {active.pharmacyProfile?.phone || '—'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Fulfillment Zone
                  </p>
                  <p className="text-[var(--text-main)]">
                    {active.pharmacyProfile?.address || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Delivery Ops
                  </p>
                  <p
                    className={
                      active.pharmacyProfile?.deliveryAvailable
                        ? 'text-[var(--brand-green)]'
                        : 'text-[var(--brand-orange)]'
                    }
                  >
                    {active.pharmacyProfile?.deliveryAvailable
                      ? 'SYSTEM ACTIVE'
                      : 'OFFLINE'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="btn flex-1 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-soft)] font-black"
              >
                Close
              </button>
              <button
                onClick={() => addToMyPharmacies(active.id)}
                className="btn btn-secondary flex-[2]"
              >
                Set as Preferred
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
