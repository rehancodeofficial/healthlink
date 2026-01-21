import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import api from "../../Lib/api";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function ViewModal({ open, onClose, item }) {
  if (!open || !item) return null;
  return (
    <div className="fixed inset-0 bg-[var(--bg-main)]/95 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-xl w-full max-w-lg relative text-[var(--text-main)]">
        <button onClick={onClose} className="absolute top-3 right-4 text-[var(--text-soft)] text-xl">✖</button>
        <img
            src="/images/logo/Asset3.png"
            alt="CureVirtual"
            style={{ width: 120, height: "auto" }}
            onError={(e) => {
              if (typeof PLACEHOLDER_LOGO !== "undefined") e.currentTarget.src = PLACEHOLDER_LOGO;
            }}
          />
        <h2 className="text-2xl font-semibold mb-6 text-[var(--text-main)]">Prescription Details</h2>
        <div className="space-y-3 text-[var(--text-soft)]">
          <p><strong>Patient:</strong> {item?.patient?.user?.name} <span className="text-xs opacity-50">({item?.patient?.user?.email})</span></p>
          <p><strong>Doctor:</strong> {item?.doctor?.user?.name}</p>
          <hr className="border-[var(--border)] my-2"/>
          <p><strong>Medication:</strong> {item.medication}</p>
          <p><strong>Dosage:</strong> {item.dosage}</p>
          <p><strong>Frequency:</strong> {item.frequency}</p>
          <p><strong>Duration:</strong> {item.duration}</p>
          {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
          <p><strong>Dispatch Status:</strong> <span className="bg-blue-900 px-2 py-1 rounded text-xs">{item.dispatchStatus}</span></p>
        </div>
      </div>
    </div>
  );
}

function CreateModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ 
    patientId: "", doctorId: "", medication: "", dosage: "", frequency: "", duration: "", notes: "" 
  });
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (open) {
      // Load dropdowns
      api.get("/pharmacy/doctors-list").then(res => setDoctors(res.data?.data || []));
      api.get("/pharmacy/patients-list").then(res => setPatients(res.data?.data || []));
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.medication) {
      toast.error("Please fill required fields (Patient, Doctor, Medication)");
      return;
    }

    try {
      setLoading(true);
      await api.post("/pharmacy/prescriptions", formData);
      toast.success("Prescription created successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-main)]/95 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-xl w-full max-w-lg relative text-[var(--text-main)] max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-4 text-[var(--text-soft)] text-xl">✖</button>
        <h2 className="text-2xl font-semibold mb-6 text-[var(--text-main)]">Create Prescription</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-muted)]">Patient *</label>
            <select name="patientId" value={formData.patientId} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)] border border-[var(--border)]">
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)]">Doctor *</label>
            <select name="doctorId" value={formData.doctorId} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)] border border-[var(--border)]">
              <option value="">Select Doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.email})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)]">Medication *</label>
            <input name="medication" value={formData.medication} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-[var(--text-muted)]">Dosage</label>
                <input name="dosage" value={formData.dosage} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)]" />
            </div>
            <div>
                <label className="block text-sm text-[var(--text-muted)]">Frequency</label>
                <input name="frequency" value={formData.frequency} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)]" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)]">Duration</label>
            <input name="duration" value={formData.duration} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)]" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)]">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)]"></textarea>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#027906] hover:bg-[#190366] text-[var(--text-main)] py-2 rounded font-bold transition">
            {loading ? "Creating..." : "Create Prescription"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditModal({ open, onClose, item, onSave }) {
  const [formData, setFormData] = useState({ 
    medication: "", dosage: "", frequency: "", duration: "", notes: "" 
  });

  useEffect(() => {
    if (item) {
      setFormData({
        medication: item.medication || "",
        dosage: item.dosage || "",
        frequency: item.frequency || "",
        duration: item.duration || "",
        notes: item.notes || ""
      });
    }
  }, [item]);

  if (!open || !item) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-main)]/95 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-xl w-full max-w-lg relative text-[var(--text-main)]">
        <button onClick={onClose} className="absolute top-3 right-4 text-[var(--text-soft)] text-xl">✖</button>
        <h2 className="text-2xl font-semibold mb-6 text-[var(--text-main)]">Edit Prescription</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-muted)]">Medication</label>
            <input name="medication" value={formData.medication} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)]" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)]">Dosage</label>
            <input name="dosage" value={formData.dosage} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)]" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)]">Frequency</label>
            <input name="frequency" value={formData.frequency} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)]" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)]">Duration</label>
            <input name="duration" value={formData.duration} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)]" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)]">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full p-2 rounded bg-[var(--bg-glass)] text-[var(--text-main)]"></textarea>
          </div>
          <button type="submit" className="w-full bg-[#027906] hover:bg-[#190366] text-[var(--text-main)] py-2 rounded">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

export default function PharmacyPrescriptions() {
  const role = "PHARMACY";
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Pharmacy";

  const [searchParams] = useSearchParams();
  const urlStatus = searchParams.get("status") || "";
  
  const [status, setStatus] = useState(urlStatus);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Update status when URL params change
  useEffect(() => {
    setStatus(urlStatus);
  }, [urlStatus]);

  const load = async () => {
    try {
      setLoading(true);
      // Map INCOMING to SENT for backend
      const backendStatus = status === "INCOMING" ? "SENT" : status;
      const res = await api.get("/pharmacy/prescriptions", { 
        params: { userId, status: backendStatus || undefined } 
      });
      setList(res.data?.data || []);
    } catch (e) {
      toast.error("Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const setDispatch = async (id, next) => {
    try {
      await api.patch(`/pharmacy/prescriptions/${id}/status`, { dispatchStatus: next });
      toast.success(`Status updated to ${next}`);
      load();
    } catch (err) {
      console.error("Failed to update dispatch status:", err);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    try {
      await api.delete(`/pharmacy/prescriptions/${id}`);
      setList(list.filter(item => item.id !== id));
      toast.success("Prescription deleted");
    } catch (err) {
      console.error("Failed to delete prescription:", err);
      toast.error("Failed to delete prescription.");
    }
  };

  const handleSaveEdit = async (id, data) => {
    try {
      await api.put(`/pharmacy/prescriptions/${id}`, data);
      setEditItem(null);
      toast.success("Prescription updated");
      load();
    } catch (err) {
      console.error("Failed to update prescription:", err);
      toast.error("Failed to update prescription.");
    }
  };

  return (
    <div className="flex bg-[var(--bg-main)] text-[var(--text-main)] min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
               <img src="/images/logo/Asset3.png" alt="CureVirtual" style={{ width: 120 }} />
               <h1 className="text-3xl font-bold text-[var(--text-main)]">
              {status === "INCOMING" || status === "SENT" 
                ? "Incoming Prescriptions" 
                : status === "ACKNOWLEDGED"
                ? "Acknowledged"
                : status === "READY"
                ? "Ready for Pickup"
                : status === "DISPENSED"
                ? "Dispensed"
                : "All Prescriptions"}
               </h1>
            </div>
            
            <button 
              onClick={() => setCreateOpen(true)}
              className="bg-[#027906] hover:bg-[#190366] text-white font-bold uppercase tracking-[0.2em] text-[10px] py-3 px-6 rounded-lg mt-8 shadow-green-500/20 transition-all hover:scale-105"
            >
              <FaPlus /> Create Prescription
            </button>
          </div>

          <div className="bg-[var(--bg-glass)] p-4 rounded-2xl mb-4 grid gap-3 sm:grid-cols-3 items-center">
            <select className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[#027906]"
                    value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="SENT">Incoming (Sent)</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="READY">Ready for Pickup</option>
              <option value="DISPENSED">Dispensed</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button 
              className="px-3 py-2 text-[var(--text-main)] hover:text-[#027906] font-semibold transition-colors flex items-center gap-2" 
              onClick={load}
            >
              Refresh List
            </button>
          </div>


          {loading ? (
            <p className="text-[var(--text-soft)]">Loading…</p>
          ) : list.length === 0 ? (
            <div className="text-[var(--text-muted)]">No prescriptions found.</div>
          ) : (
            <div className="bg-[var(--bg-glass)] rounded-2xl p-6 shadow overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="p-3">Patient</th>
                    <th className="p-3">Medication</th>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Dispatch</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-glass)] transition">
                      <td className="p-3">{p.patient?.user?.name || "Unknown"}</td>
                      <td className="p-3">{p.medication}</td>
                      <td className="p-3">{p.doctor?.user?.name || "Unknown"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            p.dispatchStatus === 'DISPENSED' ? 'bg-green-500/20 text-green-300' :
                            p.dispatchStatus === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                            'bg-blue-500/20 text-blue-300'
                        }`}>
                            {p.dispatchStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 rounded hover:bg-[var(--bg-glass)]" onClick={()=>setView(p)} title="View">
                            <FaEye className="text-blue-400" />
                          </button>
                          <button className="p-2 rounded hover:bg-[var(--bg-glass)]" onClick={()=>setEditItem(p)} title="Edit">
                            <FaEdit className="text-yellow-400" />
                          </button>
                          <button className="p-2 rounded hover:bg-[var(--bg-glass)]" onClick={()=>handleDelete(p.id)} title="Delete">
                            <FaTrash className="text-red-400" />
                          </button>
                          
                          {/* Workflow Actions */}
                          {p.dispatchStatus === "SENT" && (
                            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                                    onClick={()=>setDispatch(p.id, "ACKNOWLEDGED")}>Ack</button>
                          )}
                          {p.dispatchStatus === "ACKNOWLEDGED" && (
                            <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
                                    onClick={()=>setDispatch(p.id, "READY")}>Ready</button>
                          )}
                          {(p.dispatchStatus === "READY" || p.dispatchStatus === "ACKNOWLEDGED") && (
                            <button className="px-3 py-1 bg-[#027906] hover:bg-[#190366] rounded text-xs"
                                    onClick={()=>setDispatch(p.id, "DISPENSED")}>Dispense</button>
                          )}
                          {(p.dispatchStatus === "SENT" || p.dispatchStatus === "ACKNOWLEDGED") && (
                             <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                             onClick={()=>setDispatch(p.id, "REJECTED")}>X</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ViewModal open={!!view} onClose={()=>setView(null)} item={view} />
      <EditModal open={!!editItem} onClose={()=>setEditItem(null)} item={editItem} onSave={handleSaveEdit} />
      <CreateModal open={createOpen} onClose={()=>setCreateOpen(false)} onSuccess={load} />
      
      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
}
