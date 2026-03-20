import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Lib/api";
import JitsiVideoCall from "../components/JitsiVideoCall";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";

/**
 * CallPage — The main video call interface for appointments.
 * Route: /call/:appointmentId
 */
const CallPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/appointments/${appointmentId}`);
        setAppointment(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch appointment:", err);
        const msg = err.response?.data?.error || "Failed to load appointment details";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const handleClose = () => {
    // Navigate back to dashboard or previous page
    const role = localStorage.getItem("role") || localStorage.getItem("userRole");
    if (role === "DOCTOR") {
      navigate("/doctor/dashboard");
    } else {
      navigate("/patient/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner />
        <p className="ml-4 text-white font-semibold">Preparing your secure session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <div className="bg-red-900/20 p-8 rounded-2xl border border-red-500/50 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!appointment?.roomName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Room Not Found</h1>
        <p className="text-gray-400 mb-6">This appointment is not configured for video calling.</p>
        <button
          onClick={handleClose}
          className="px-6 py-2 bg-white text-black rounded-lg font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <JitsiVideoCall
        roomName={appointment.roomName}
        displayName={appointment.doctorName || "User"} // Display name will be set by context normally, but we use this as fallback
        onClose={handleClose}
      />
    </div>
  );
};

export default CallPage;
