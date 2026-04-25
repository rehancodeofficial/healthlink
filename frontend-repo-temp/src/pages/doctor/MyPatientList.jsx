import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import api from "../../Lib/api";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";

export default function MyPatientList() {
  const role = "DOCTOR";
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Doctor";
  const doctorUserId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctor/patients", {
        params: {
          doctorUserId,
          search: search || undefined,
          gender: gender || undefined,
          bloodGroup: bloodGroup || undefined,
          minAge: minAge || undefined,
          maxAge: maxAge || undefined,
        },
      });
      setRows(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [doctorUserId, search, gender, bloodGroup, minAge, maxAge]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const filterBar = useMemo(() => (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
      <input className="rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
             placeholder="Search name/MRN/address"
             value={search} onChange={(e)=>setSearch(e.target.value)} />
      <select className="rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
              value={gender} onChange={(e)=>setGender(e.target.value)}>
        <option value="">Gender</option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
        <option value="OTHER">Other</option>
        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
      </select>
      <select className="rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
              value={bloodGroup} onChange={(e)=>setBloodGroup(e.target.value)}>
        <option value="">Blood Group</option>
        <option value="A_POSITIVE">A+</option>
        <option value="A_NEGATIVE">A-</option>
        <option value="B_POSITIVE">B+</option>
        <option value="B_NEGATIVE">B-</option>
        <option value="AB_POSITIVE">AB+</option>
        <option value="AB_NEGATIVE">AB-</option>
        <option value="O_POSITIVE">O+</option>
        <option value="O_NEGATIVE">O-</option>
        <option value="UNKNOWN">Unknown</option>
      </select>
      <input className="rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]" placeholder="Min Age"
             value={minAge} onChange={(e)=>setMinAge(e.target.value)} />
      <input className="rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]" placeholder="Max Age"
             value={maxAge} onChange={(e)=>setMaxAge(e.target.value)} />
      <div className="col-span-2 md:col-span-1 flex gap-2">
        <button onClick={fetchPatients} className="bg-[#027906] hover:bg-[#190366] px-4 py-2 rounded">Apply</button>
        <button onClick={() => { setSearch(""); setGender(""); setBloodGroup(""); setMinAge(""); setMaxAge(""); }}
                className="bg-[var(--bg-glass)] px-4 py-2 rounded">Reset</button>
      </div>
    </div>
  ), [search, gender, bloodGroup, minAge, maxAge, fetchPatients]);

  const ageFromDob = (dob) => {
    if (!dob) return "—";
    const d = new Date(dob);
    const diff = Date.now() - d.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />
        <div className="p-6 space-y-6">
          <h1 className="text-3xl font-bold text-[var(--text-main)]">My Patients</h1>

          {filterBar}

          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-4">
            {loading ? (
              <p className="text-[var(--text-soft)]">Loading...</p>
            ) : rows.length === 0 ? (
              <p className="text-[var(--text-muted)]">No patients have selected you yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--text-soft)] uppercase text-sm">
                      <th className="p-3">Patient</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3">Blood Group</th>
                      <th className="p-3">Age</th>
                      <th className="p-3">Address</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => (
                      <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-glass)]">
                        <td className="p-3">
                          <div className="font-semibold">{p.user?.name || "—"}</div>
                          <div className="text-xs text-[var(--text-soft)]">{p.user?.email}</div>
                          <div className="text-xs text-[var(--text-muted)]">MRN: {p.medicalRecordNumber || "—"}</div>
                        </td>
                        <td className="p-3">{p.gender}</td>
                        <td className="p-3">{p.bloodGroup?.replace("_POSITIVE","+").replace("_NEGATIVE","-") || "—"}</td>
                        <td className="p-3">{ageFromDob(p.dateOfBirth)}</td>
                        <td className="p-3">{p.address || "—"}</td>
                        <td className="p-3">
                          <button
                            className="px-3 py-1 rounded bg-[var(--bg-glass)] hover:bg-white/20 flex items-center gap-2"
                            title="View Profile"
                            onClick={() => window.open(`/patient/${p.id}`, "_blank")}
                          >
                            <FaEye /> View
                          </button>
                          {/* Add quick actions later: Message / New Appointment */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
