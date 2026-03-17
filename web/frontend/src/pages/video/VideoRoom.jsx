import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoRoomComponent from "../../components/VideoRoom";
import api from "../../Lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-toastify";

export default function VideoRoomPage() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const isDoctor = role === "DOCTOR";
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "User";

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        const identity = `${role.toLowerCase()}-${userId}`;

        const res = await api.post("/videocall/token", {
          identity,
          roomName: roomName,
        });

        if (res.data && res.data.token) {
          setToken(res.data.token);
        } else {
          throw new Error("Failed to get video token");
        }
      } catch (err) {
        console.error("Token fetch error:", err);
        toast.error("Could not establish video connection. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (roomName && userId) {
      fetchToken();
    }
  }, [roomName, userId, role]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-white/60 font-medium animate-pulse">Establishing Secure Uplink...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Connection Failed</h1>
          <p className="text-gray-400 mb-8">
            We couldn't generate a secure token for this session. Please check your internet and try
            again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[var(--brand-green)] rounded-xl font-bold hover:opacity-90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <VideoRoomComponent
      token={token}
      roomName={roomName}
      appointmentId={roomName.replace("consult_", "")}
      isDoctor={isDoctor}
      doctorName={isDoctor ? userName : ""}
      patientId="" // Would ideally come from appointment data
      onDisconnect={() => navigate("/video/lobby")}
    />
  );
}
