import { useParams, useNavigate } from "react-router-dom";
import ZegoVideoCall from "../../components/ZegoVideoCall";

export default function VideoRoomPage() {
  const { roomName } = useParams();
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "User";

  const handleClose = () => {
    navigate("/video/lobby");
  };

  if (!roomName) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">No Room Specified</h1>
          <p className="text-gray-400 mb-8">
            Please enter a valid room name to join a video consultation.
          </p>
          <button
            onClick={() => navigate("/video/lobby")}
            className="px-6 py-3 bg-[var(--brand-green)] rounded-xl font-bold hover:opacity-90 transition"
          >
            Go to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black">
      <ZegoVideoCall
        roomName={roomName}
        userId={localStorage.getItem("userId") || "user-id"}
        userName={userName}
        onClose={handleClose}
      />
    </div>
  );
}
