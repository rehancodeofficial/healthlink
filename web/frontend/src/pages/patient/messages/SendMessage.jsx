import { useEffect, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import api from "../../../Lib/api";

export default function PatientSendMessage() {
  const [doctors, setDoctors] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const role = "PATIENT";
  const userId = localStorage.getItem("userId") || "";
  const userName =
    localStorage.getItem("userName") || localStorage.getItem("name") || "Patient";



  // Load doctors for dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/patient/doctors/all");
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        // Expect user.id at doctor.user.id for messaging by userId
        setDoctors(
          list.map((d) => ({
            id: d.user?.id || d.id, // fallback
            name: d.user ? `${d.user.firstName} ${d.user.lastName}`.trim() : (d.name || "Unnamed Doctor"),
            email: d.user?.email || d.email || "",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!receiverId || !content.trim()) {
      setError("Please select a doctor and type a message.");
      return;
    }
    setSending(true);
    try {
      await api.post("/patient/messages/send", {
        senderId: userId,     // patient userId
        receiverId,           // doctor userId
        content,
      });
      setSuccess("Message sent successfully!");
      setReceiverId("");
      setContent("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />

        <div className="p-6">
                          <img
                    src="/images/logo/Asset3.png"
                    alt="CureVirtual"
                    style={{ width: 120, height: "auto" }}
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_LOGO; }} // fallback if missing
                  />
          <h1 className="text-2xl font-bold mb-6 text-[#FFFFFF]">Send Message</h1>

          <form
            onSubmit={handleSend}
            className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg max-w-xl"
          >
            <div className="mb-4">
              <label className="block font-semibold mb-2">Select Doctor</label>
              {loading ? (
                <p>Loading doctors...</p>
              ) : (
                <select
                  className="w-full border border-gray-300 text-black rounded-md p-2"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.email ? `(${d.email})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Message</label>
              <textarea
                className="w-full border border-gray-300 text-black rounded-md p-3 h-32 focus:outline-none focus:ring-2 focus:ring-[#027906]"
                placeholder="Type your message here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </div>

            {success && <p className="text-green-400 mb-2">{success}</p>}
            {error && <p className="text-red-400 mb-2">{error}</p>}

            <button
              type="submit"
              disabled={sending}
              className="bg-[#027906] text-[var(--text-main)] px-5 py-2 rounded-md hover:bg-[#190366] flex items-center gap-2 disabled:opacity-60"
            >
              <FaPaperPlane />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
