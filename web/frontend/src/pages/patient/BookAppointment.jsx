// FILE: src/pages/patient/BookAppointment.jsx
import React, { useState, useEffect } from "react";
import api from "../../Lib/api";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { toast } from "react-toastify";

import BookingSlots from "../../components/BookingSlots";

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    selectedSlotId: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const patientId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await api.get("/api/doctor/list");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setDoctors(data);
      } catch {
        toast.error("Failed to load doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorChange = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    setSelectedDoctor(doctor);
    setFormData({
      ...formData,
      doctorId,
      appointmentDate: "",
      selectedSlotId: "",
    });
  };

  const handleSlotSelect = (slot) => {
    setFormData((prev) => ({ ...prev, selectedSlotId: slot.id }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.selectedSlotId) {
      toast.error("Please select an available time slot");
      return;
    }

    setLoading(true);
    try {
      await api.post("/schedule/book", {
        startTime: formData.selectedSlotId, // The ID is now the ISO startTime
        doctorId: formData.doctorId,
        patientId,
        reason: formData.reason,
      });
      toast.success("Appointment booked successfully!");
      setFormData({ doctorId: "", appointmentDate: "", selectedSlotId: "", reason: "" });
      setSelectedDoctor(null);
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
                    value={formData.appointmentDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appointmentDate: e.target.value,
                        selectedSlotId: "",
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-transparent border border-[var(--border)] rounded-lg p-3 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {/* Available Time Slots via Component */}
              {formData.appointmentDate && (
                <div>
                  <label className="block font-medium mb-2 text-[var(--text-main)]">
                    Select Time Slot
                  </label>
                  <BookingSlots
                    doctorId={formData.doctorId}
                    date={new Date(formData.appointmentDate)}
                    onSlotSelect={handleSlotSelect}
                  />
                </div>
              )}

              {/* Reason */}
              {formData.selectedSlotId && (
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
                disabled={loading || !formData.selectedSlotId}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  loading || !formData.selectedSlotId
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
