// FILE: src/pages/patient/BookAppointment.jsx
import React, { useState, useEffect } from "react";
import api from "../../Lib/api";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { toast } from "react-toastify";

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    selectedSlot: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const patientId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await api.get("/api/doctor/list");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        console.log("✅ Loaded doctors:", data);
        setDoctors(data);
      } catch (err) {
        console.error("❌ Error loading doctors:", err);
        toast.error("Failed to load doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        setLoadingSlots(true);
        const date = formData.appointmentDate.split("T")[0]; // Get YYYY-MM-DD
        const res = await api.get(
          `/api/schedule/available-slots/${formData.doctorId}?date=${date}`
        );

        if (res.data.success) {
          setAvailableSlots(res.data.data || []);
          if (res.data.data.length === 0) {
            toast.info(res.data.message || "No available slots for this date");
          }
        }
      } catch (err) {
        console.error("❌ Error loading slots:", err);
        toast.error("Failed to load available time slots");
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    if (formData.doctorId && formData.appointmentDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setFormData((prev) => ({ ...prev, selectedSlot: "" }));
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const handleDoctorChange = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    setSelectedDoctor(doctor);
    setFormData({
      ...formData,
      doctorId,
      appointmentDate: "",
      selectedSlot: "",
    });
    setAvailableSlots([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.selectedSlot) {
      toast.error("Please select an available time slot");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/patient/appointments", {
        doctorId: formData.doctorId,
        appointmentDate: formData.selectedSlot, // Use the full datetime from selected slot
        reason: formData.reason,
        patientId,
      });
      toast.success("Appointment booked successfully!");
      setFormData({ doctorId: "", appointmentDate: "", selectedSlot: "", reason: "" });
      setSelectedDoctor(null);
      setAvailableSlots([]);
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.error || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <Sidebar role="PATIENT" />
      <div className="flex-1 flex flex-col">
        <Topbar userName={userName} />

        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-6 tracking-wide">
            Book Appointment
          </h1>

          <div className="max-w-2xl mx-auto bg-[var(--bg-glass)] p-8 rounded-xl shadow-lg border border-[var(--border)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Doctor Selection */}
              <div>
                <label className="block font-medium mb-2 text-[var(--text-main)]">
                  Select Doctor
                </label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  className="w-full bg-transparent border border-[var(--border)] rounded-lg p-3 focus:ring-2 focus:ring-blue-500 text-[var(--text-main)]"
                  required
                  disabled={loadingDoctors}
                >
                  <option value="">
                    {loadingDoctors ? "Loading doctors..." : "Select a doctor"}
                  </option>
                  {doctors.length > 0
                    ? doctors.map((doc) => (
                        <option
                          key={doc.id}
                          value={doc.id}
                          className="bg-[var(--bg-card)] text-[var(--text-main)]"
                        >
                          {doc.user?.firstName} {doc.user?.lastName} —{" "}
                          {doc.specialization || "General Medicine"}
                        </option>
                      ))
                    : !loadingDoctors && <option disabled>No doctors available</option>}
                </select>
              </div>

              {/* Date Selection */}
              {formData.doctorId && (
                <div>
                  <label className="block font-medium mb-2 text-[var(--text-main)]">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={formData.appointmentDate.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appointmentDate: e.target.value,
                        selectedSlot: "",
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-transparent border border-[var(--border)] rounded-lg p-3 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {/* Available Time Slots */}
              {formData.appointmentDate && (
                <div>
                  <label className="block font-medium mb-2 text-[var(--text-main)]">
                    Available Time Slots
                  </label>
                  {loadingSlots ? (
                    <p className="text-[var(--text-muted)]">Loading available slots...</p>
                  ) : availableSlots.length === 0 ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-400">
                        No available slots for this date. Please select another date or doctor.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 bg-[var(--bg-card)] rounded-lg">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.datetime}
                          type="button"
                          onClick={() => setFormData({ ...formData, selectedSlot: slot.datetime })}
                          className={`p-3 rounded-lg border transition ${
                            formData.selectedSlot === slot.datetime
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-white/5 border-gray-600 hover:bg-white/10 text-gray-300"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reason */}
              {formData.selectedSlot && (
                <div>
                  <label className="block font-medium mb-2 text-[var(--text-main)]">
                    Reason for Visit
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows="3"
                    placeholder="Briefly describe your reason..."
                    className="w-full bg-transparent border border-[var(--border)] rounded-lg p-3 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.selectedSlot}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  loading || !formData.selectedSlot
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-700 hover:bg-blue-800"
                } text-white`}
              >
                {loading ? "Booking..." : "Book Appointment"}
              </button>
            </form>

            {/* Selected Doctor Info */}
            {selectedDoctor && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="font-semibold text-blue-400 mb-2">Selected Doctor</h3>
                <p className="text-[var(--text-soft)]">
                  <strong>Name:</strong> {selectedDoctor.user?.firstName}{" "}
                  {selectedDoctor.user?.lastName}
                </p>
                <p className="text-[var(--text-soft)]">
                  <strong>Specialization:</strong> {selectedDoctor.specialization}
                </p>
                <p className="text-[var(--text-soft)]">
                  <strong>Fee:</strong> ${selectedDoctor.consultationFee}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
