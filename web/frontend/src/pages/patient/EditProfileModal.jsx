import { useState, useEffect } from "react";
import api from "../../Lib/api";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const BLOOD_GROUP_OPTIONS = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A-" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B-" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB-" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O-" },
  { value: "UNKNOWN", label: "Unknown" },
];

export default function EditProfileModal({ isOpen, onClose, profile, onProfileUpdate }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        // dateOfBirth and gender are in profile.user (User model)
        dateOfBirth: profile.user?.dateOfBirth ? profile.user.dateOfBirth.split("T")[0] : 
                     (profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : ""),
        gender: profile.user?.gender || profile.gender || "OTHER",
        firstName: profile.user?.firstName || "",
        lastName: profile.user?.lastName || "",
        phone: profile.user?.phone || "",
        // bloodGroup and other fields are directly in profile (PatientProfile model)
        bloodGroup: profile.bloodGroup || "UNKNOWN",
        height: profile.height || "",
        weight: profile.weight || "",
        address: profile.address || "",
        emergencyContact: profile.emergencyContact || "",
        emergencyContactName: profile.emergencyContactName || "",
        emergencyContactEmail: profile.emergencyContactEmail || "",
        allergies: profile.allergies || "",
        medications: profile.medications || "",
        medicalHistory: profile.medicalHistory || "",
        insuranceProvider: profile.insuranceProvider || "",
        medicalRecordNumber: profile.medicalRecordNumber || "",
        insuranceMemberId: profile.insuranceMemberId || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        userId: profile.userId, 
        ...formData,
        // Convert numbers
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
      };

      const res = await api.put("/patient/profile", payload);
      
      if (res.data?.data) {
        toast.success("Profile updated successfully!");
        onProfileUpdate(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Edit Profile</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Update your personal and medical information</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Spec */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500">Personal Specification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                    >
                        {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Blood Group</label>
                    <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                    >
                        {BLOOD_GROUP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Height (cm)</label>
                        <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            placeholder="e.g. 175"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Weight (kg)</label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            placeholder="e.g. 70"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                        />
                    </div>
                </div>
                 <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Full Address"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                    />
                </div>
                 <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Emergency Contact Information</label>
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Full Name</label>
                    <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        placeholder="Jane Doe"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                    />
                </div>
              </div>
            </div>

             {/* System Identifiers */}
             <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Insurance & ID</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Medical Record Number (MRN)</label>
                     <input
                        type="text"
                        name="medicalRecordNumber"
                        value={formData.medicalRecordNumber}
                        onChange={handleChange}
                         placeholder="System ID"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                    />
                  </div>
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Insurance Provider</label>
                     <input
                        type="text"
                        name="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                    />
                  </div>
                   <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Insurance Member ID</label>
                     <input
                        type="text"
                        name="insuranceMemberId"
                        value={formData.insuranceMemberId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                    />
                  </div>
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Email Address</label>
                    <input
                        type="email"
                        name="emergencyContactEmail"
                        value={formData.emergencyContactEmail}
                        onChange={handleChange}
                        placeholder="emergency@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                    />
                 </div>
                 <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Phone & Relation</label>
                    <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        placeholder="Mother - +1 555-0123"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all dark:text-white"
                    />
                 </div>
              </div>
            </div>

            {/* Clinical Observations */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">Clinical Observations</h3>
               <div className="space-y-4">
                   <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Allergies</label>
                    <textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Active Medications</label>
                    <textarea
                        name="medications"
                        value={formData.medications}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all resize-none"
                    />
                  </div>
                   <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wide">Medical History</label>
                    <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-0 text-sm font-medium transition-all resize-none"
                    />
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-xl bg-[#0F2C59] text-white text-sm font-bold shadow-lg shadow-blue-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

EditProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  profile: PropTypes.object,
  onProfileUpdate: PropTypes.func.isRequired,
};
