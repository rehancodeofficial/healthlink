import { useEffect, useState } from "react";
import Video from "twilio-video";
import { useNavigate, useParams } from "react-router-dom";

export default function VideoRoom() {
  const { roomName } = useParams();
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("twilioToken");
  const identity = localStorage.getItem("userName");

  useEffect(() => {
    if (!token || !roomName) return;

    const participantConnected = (participant) => {
      setParticipants((prev) => [...prev, participant]);
    };

    const participantDisconnected = (participant) => {
      setParticipants((prev) => prev.filter((p) => p !== participant));
    };

    Video.connect(token, { name: roomName, audio: true, video: true }).then((connectedRoom) => {
      setRoom(connectedRoom);

      // Attach local participant tracks
      const localContainer = document.getElementById("local-video");
      connectedRoom.localParticipant.tracks.forEach((publication) => {
        if (publication.track) {
          localContainer.appendChild(publication.track.attach());
        }
      });

      connectedRoom.on("participantConnected", participantConnected);
      connectedRoom.on("participantDisconnected", participantDisconnected);
      connectedRoom.participants.forEach(participantConnected);
    });

    return () => {
      setRoom((currentRoom) => {
        if (currentRoom) {
          currentRoom.localParticipant.tracks.forEach((trackPub) => {
            if (trackPub.track) trackPub.track.stop();
          });
          currentRoom.disconnect();
        }
        return null;
      });
    };
  }, [roomName, token]);

  const handleLeave = () => {
    if (room) {
      room.disconnect();
      navigate("/video/lobby");
    }
  };

  const attachTracks = (participant) => {
    const container = document.getElementById(`participant-${participant.sid}`);
    participant.tracks.forEach((pub) => {
      if (pub.isSubscribed) {
        container.appendChild(pub.track.attach());
      }
    });
    participant.on("trackSubscribed", (track) => {
      container.appendChild(track.attach());
    });
    participant.on("trackUnsubscribed", (track) => {
      track.detach().forEach((el) => el.remove());
    });
  };

  useEffect(() => {
    participants.forEach((participant) => attachTracks(participant));
  }, [participants]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <h1 className="text-2xl font-bold mb-4 text-green-400">Live Consultation</h1>
      <p className="mb-2 text-[var(--text-muted)]">Room: {roomName}</p>

      <div id="video-grid" className="flex flex-wrap justify-center gap-4 mb-4">
        <div id={`participant-local`} className="bg-gray-800 rounded-lg overflow-hidden p-2">
          <h3 className="text-sm text-center mb-1 text-green-300">{identity} (You)</h3>
          <div id="local-video" className="w-64 h-48 bg-black rounded"></div>
        </div>
        {participants.map((participant) => (
          <div
            key={participant.sid}
            id={`participant-${participant.sid}`}
            className="bg-gray-800 rounded-lg overflow-hidden p-2"
          >
            <h3 className="text-sm text-center mb-1 text-blue-300">{participant.identity}</h3>
          </div>
        ))}
      </div>

      <button
        onClick={handleLeave}
        className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md text-[var(--text-main)] font-semibold"
      >
        End Call
      </button>
    </div>
  );
}
