import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import api from "../../Lib/api";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";

const PLACEHOLDER_LOGO = "/images/logo/Asset3.png";

function DoctorViewModal({ open, onClose, doctor }) {
  if (!open || !doctor) return null;
  const d = doctor; // DoctorProfile with embedded user
  const langs = safeParseArray(d.languages);
  const availability = safeParseObj(d.availability);

  return (
    <div className="fixed inset-0 bg-[var(--bg-main)]/95 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-xl w-full max-w-3xl relative text-[var(--text-main)]">
        <img
          src="/images/logo/Asset3.png"
          alt="CureVirtual"
          style={{ width: 120, height: "auto" }}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_LOGO;
          }}
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-[var(--text-soft)] text-xl"
          aria-label="Close modal"
        >
          ✖
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-[var(--text-main)]">Doctor Profile</h2>

        <div className="grid md:grid-cols-2 gap-4 text-[var(--text-soft)]">
          <div>
            <p><strong>Name:</strong> {d.user ? `${d.user.firstName} ${d.user.lastName}`.trim() : "—"}</p>
            <p><strong>Email:</strong> {d.user?.email || "—"}</p>
            <p><strong>Specialization:</strong> {d.specialization || "—"}</p>
            <p><strong>Qualifications:</strong> {d.qualifications || "—"}</p>
            <p><strong>Experience:</strong> {d.yearsOfExperience != null ? `${d.yearsOfExperience} yrs` : "—"}</p>
            <p><strong>Consultation Fee:</strong> {d.consultationFee != null ? `$${Number(d.consultationFee).toFixed(2)}` : "—"}</p>
          </div>
          <div>
            <p><strong>License #:</strong> {d.licenseNumber || "—"}</p>
            <p><strong>Hospital:</strong> {d.hospitalAffiliation || "—"}</p>
            <p><strong>Languages:</strong> {langs.length ? langs.join(", ") : "—"}</p>
            <p className="mt-2"><strong>Availability:</strong></p>
            <div className="text-sm opacity-90 whitespace-pre-wrap">
              {availability
                ? Object.entries(availability)
                    .map(([k, v]) => `${title(k)}: ${v}`)
                    .join("\n")
                : "—"}
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="font-semibold mt-2">Bio</p>
            <div className="text-sm opacity-90 whitespace-pre-wrap">{d.bio || "—"}</div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-[var(--bg-glass)] hover:bg-white/20 rounded text-[var(--text-main)]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function safeParseArray(v) {
  try {
    const parsed = typeof v === "string" ? JSON.parse(v) : v;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function safeParseObj(v) {
  try {
    return typeof v === "string" ? JSON.parse(v) : v || null;
  } catch {
    return null;
  }
}
function title(s = "") {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function MyDoctors() {
  const role = "PATIENT";
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Patient";
  const patientUserId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [viewDoctor, setViewDoctor] = useState(null);

  const fetchAssigned = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/patient/doctors", { params: { patientUserId } });
      setRows(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assigned doctors");
    } finally {
      setLoading(false);
    }
  }, [patientUserId]);

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((d) => {
      const name = d.user ? `${d.user.firstName} ${d.user.lastName}`.toLowerCase() : "";
      const email = (d.user?.email || "").toLowerCase();
      const spec = (d.specialization || "").toLowerCase();
      return name.includes(q) || email.includes(q) || spec.includes(q);
    });
  }, [rows, search]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <img
              src="/images/logo/Asset3.png"
              alt="CureVirtual"
              style={{ width: 120, height: "auto" }}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_LOGO;
              }}
            />
            <h1 className="text-3xl font-bold text-[var(--text-main)]">My Doctors</h1>
            <input
              placeholder="Search name/email/specialization"
              className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)] w-full sm:w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg overflow-x-auto">
            {loading ? (
              <p className="text-[var(--text-soft)]">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-[var(--text-muted)]">No doctors assigned yet.</p>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-soft)] uppercase text-sm">
                    <th className="p-3">Name</th>
                    <th className="p-3">Specialization</th>
                    <th className="p-3">Experience</th>
                    <th className="p-3">Fee</th>
                    <th className="p-3 text-center">Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-glass)] transition">
                      <td className="p-3">
                        <div className="font-semibold">{d.user ? `${d.user.firstName} ${d.user.lastName}`.trim() : "—"}</div>
                        <div className="text-xs text-[var(--text-soft)]">{d.user?.email}</div>
                      </td>
                      <td className="p-3">{d.specialization || "—"}</td>
                      <td className="p-3">
                        {d.yearsOfExperience != null ? `${d.yearsOfExperience} yrs` : "—"}
                      </td>
                      <td className="p-3">
                        {d.consultationFee != null ? `$${Number(d.consultationFee).toFixed(2)}` : "—"}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center">
                          <button
                            onClick={() => setViewDoctor(d)}
                            title="View Profile"
                            className="hover:scale-110 transition"
                          >
                            <FaEye className="text-blue-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <DoctorViewModal
        open={!!viewDoctor}
        doctor={viewDoctor}
        onClose={() => setViewDoctor(null)}
      />
    </div>
  );
}
