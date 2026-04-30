import { useEffect, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import DashboardLayout from "../../../layouts/DashboardLayout";
import api from "../../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PharmacySendMessage() {
  const [recipients, setRecipients] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const userId = localStorage.getItem("userId");
  const userName =
    localStorage.getItem("userName") || localStorage.getItem("name") || "Pharmacy";

  // Load contacts
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/messages/contacts/all");
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setRecipients(list);
      } catch (err) {
        console.error("Failed to load contacts:", err);
        toast.error("Failed to load contacts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!receiverId || !content.trim()) {
      toast.error("Select a recipient and type a message.");
      return;
    }
    setSending(true);
    try {
      await api.post("/messages/send", {
        senderId: userId,
        receiverId,
        content: content.trim(),
      });
      toast.success("Message sent!");
      setReceiverId("");
      setContent("");
    } catch (err) {
      console.error("Send failed:", err);
      toast.error(err?.response?.data?.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout role="PHARMACY" user={{ id: userId, name: userName }}>
      <div className="p-6 min-h-screen bg-[var(--bg-main)]/90 text-[var(--text-main)]">
        <h1 className="text-2xl font-bold mb-6 text-[#ffffff]">Send Message</h1>

        <form
          onSubmit={handleSend}
          className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg max-w-xl mx-auto"
        >
          {/* Recipient dropdown */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">Select Recipient</label>
            {loading ? (
              <p>Loading contacts...</p>
            ) : (
              <select
                className="w-full border border-gray-300 text-black rounded-md p-2"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                required
              >
                <option value="">-- Choose Recipient --</option>
                {recipients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Message */}
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

          <button
            type="submit"
            disabled={sending || !receiverId || !content.trim()}
            className="bg-[#027906] text-[var(--text-main)] px-5 py-2 rounded-md hover:bg-[#190366] flex items-center gap-2 disabled:opacity-60"
          >
            <FaPaperPlane />
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
