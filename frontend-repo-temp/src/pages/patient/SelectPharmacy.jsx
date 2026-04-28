import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import api from "../../Lib/api";

export default function PatientSelectPharmacy() {
  const role = "PATIENT";
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Patient";

  const [q, setQ] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radiusKm, setRadiusKm] = useState(25);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = { q: q || undefined };
      if (lat && lng && radiusKm) {
        params.lat = lat; params.lng = lng; params.radiusKm = radiusKm;
      }
      const r = await api.get("/pharmacy/list", { params });
      const items = r.data?.data?.items || r.data?.data || [];
      setList(Array.isArray(items) ? items : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [q, lat, lng, radiusKm]);

  useEffect(() => { load(); }, [load]);

  const choose = async (pharmacyId) => {
    try {
      await api.post("/pharmacy/patient/select", { patientId: userId, pharmacyId });
      setMsg("✅ Selected!");
      setTimeout(() => setMsg(""), 2000);
    } catch(err) {
      console.error(err);
      setMsg(err?.response?.data?.error || "❌ Failed to select pharmacy");
      setTimeout(() => setMsg(""), 2500);
    }
  };

  return (
    <div className="flex bg-[#000000]/90 text-[var(--text-main)] min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <img src="/images/logo/Asset3.png" alt="CureVirtual" style={{ width: 120 }} />
            <h1 className="text-3xl font-bold text-[var(--text-main)]">Select Pharmacy</h1>
            <div>{msg}</div>
          </div>

          <div className="bg-[var(--bg-glass)] rounded-2xl p-4 mb-4 grid gap-3 sm:grid-cols-5">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search name/city/state"
                   className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)]" />
            <input value={lat} onChange={(e)=>setLat(e.target.value)} placeholder="Lat"
                   className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)]" />
            <input value={lng} onChange={(e)=>setLng(e.target.value)} placeholder="Lng"
                   className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)]" />
            <input type="number" value={radiusKm} onChange={(e)=>setRadiusKm(e.target.value)} placeholder="Radius km"
                   className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)]" />
            <button onClick={load} className="px-3 py-2 bg-[#027906] hover:bg-[#190366] rounded">Apply</button>
          </div>

          {loading ? (
            <p className="text-[var(--text-soft)]">Loading…</p>
          ) : list.length === 0 ? (
            <div className="text-[var(--text-muted)]">No pharmacies found.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {list.map(p => (
                <div key={p.id} className="bg-[var(--bg-glass)] rounded-2xl p-4">
                  <div className="text-xl font-semibold">{p.displayName || "Pharmacy"}</div>
                  <div className="text-[var(--text-soft)]">{p.address}</div>
                  <div className="text-[var(--text-soft)]">{[p.city, p.state, p.country].filter(Boolean).join(", ")}</div>
                  <div className="text-[var(--text-muted)] text-sm mt-2">{p.services?.slice(0,120)}</div>
                  <div className="mt-4 flex justify-end">
                    <button onClick={()=>choose(p.id)} className="px-4 py-2 bg-[#027906] hover:bg-[#190366] rounded">
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
