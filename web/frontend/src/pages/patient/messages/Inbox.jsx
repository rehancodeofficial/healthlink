import { useEffect, useState, useCallback } from "react";
import {
  FaEnvelopeOpen,
  FaEnvelope,
  FaTimes,
  FaPaperPlane,
  FaTrash,
} from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import api from "../../../Lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* -------- Small confirm dialog (prompt modal) -------- */
function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-[var(--bg-main)]/95 flex items-center justify-center">
      <div className="bg-[var(--bg-card)] text-[var(--text-main)] w-full max-w-md rounded-2xl shadow-xl p-6 relative">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-[var(--text-soft)] mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-[var(--border)] hover:bg-[var(--bg-glass)] disabled:opacity-50"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-[var(--text-main)] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientInbox() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const role = "PATIENT";
  const userId = localStorage.getItem("userId") || "";
  const userName =
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "Patient";

  const fetchInbox = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get(`/patient/messages/inbox`, {
        params: { patientId: userId },
      });
      const items = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMessages(items);
    } catch (err) {
      console.error("Failed to fetch inbox:", err);
      toast.error("Failed to load inbox.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  // open viewer, mark as read immediately
// open viewer, mark as read immediately (optimistic)
const openMessage = async (msg) => {
  setSelectedMessage(msg);

  if (!msg.readAt) {
    // Optimistic local update so UI changes immediately
    const nowIso = new Date().toISOString();
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, readAt: nowIso } : m))
    );

    try {
      // If your backend expects userId, keep body; if it expects query, move it to { params: { userId } }
      await api.patch(`/patient/messages/read/${msg.id}`, { userId });
    } catch (err) {
      // Roll back if the server rejects, though this is usually non-critical
      console.warn("Mark read failed:", err?.response?.data || err);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, readAt: null } : m))
      );
    }
  }
};


  const handleReply = async () => {
    if (!replyContent.trim() || !selectedMessage) return;
    setSending(true);
    try {
      await api.post("/patient/messages/send", {
        senderId: userId, // PATIENT (current user)
        receiverId: selectedMessage.sender?.id, // Doctor's User.id
        content: replyContent,
      });
      setReplyContent("");
      setSelectedMessage(null);
      await fetchInbox();
      toast.success("Reply sent!");
    } catch (err) {
      console.error("Failed to send reply:", err);
      toast.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  // delete flow
  const requestDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const cancelDelete = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setConfirmLoading(true);
      await api.delete(`/patient/messages/delete/${pendingDeleteId}`, {
        params: { userId }, // used by backend auth
      });
      setMessages((prev) => prev.filter((m) => m.id !== pendingDeleteId));
      if (selectedMessage?.id === pendingDeleteId) setSelectedMessage(null);
      toast.success("Message deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err?.response?.data?.error || "Failed to delete message");
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setPendingDeleteId(null);
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-main)]">Patient Inbox</h1>
          </div>

          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p>No messages received yet.</p>
          ) : (
            <div className="overflow-x-auto bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-main)] bg-[var(--bg-glass)]">
                    <th className="p-3">From</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                                        
                      {messages.map((msg) => {
                        const isRead = !!msg.readAt;
                        return (
                          <tr
                            key={msg.id}
                            className={`border-b border-[var(--border)] hover:bg-[var(--bg-main)] transition cursor-pointer ${
                              isRead ? "text-[var(--text-soft)]" : "font-semibold text-[var(--text-main)]"
                            }`}
                            onClick={() => openMessage(msg)}
                          >
                            <td className="p-3">
                              {msg.sender?.firstName
                                ? `${msg.sender.firstName} ${msg.sender.lastName || ""}`
                                : msg.sender?.name || "Unknown"}
                            </td>
                            <td className="p-3 truncate max-w-xs">{msg.content}</td>
                            <td className="p-3">{new Date(msg.createdAt).toLocaleString()}</td>

                            {/* Status */}
                            <td className="p-3 text-center">
                              {isRead ? (
                                <FaEnvelopeOpen className="text-green-400 mx-auto" />
                              ) : (
                                <FaEnvelope className="text-[var(--text-soft)] mx-auto" />
                              )}
                            </td>

                            {/* Actions (unchanged, but keep stopPropagation on trash) */}
                            <td className="p-3 text-center">
                              <button
                                title="Delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestDelete(msg.id);
                                }}
                                className="hover:scale-110 transition"
                              >
                                <FaTrash className="text-red-400 inline-block" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                </tbody>
              </table>
            </div>
          )}
          {/* View + Reply modal */}
          {selectedMessage && (
            <div className="fixed inset-0 bg-[var(--bg-main)]/95 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg text-black p-6 relative">
                {/* Close button */}
                                <img
                    src="/images/logo/Asset3.png"
                    alt="CureVirtual"
                    style={{ width: 120, height: "auto" }}
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_LOGO; }} // fallback if missing
                  />
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
                >
                  <FaTimes size={20} />
                </button>

                {/* Header with inline delete */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#190366]">
                    From {selectedMessage.sender?.firstName
                      ? `${selectedMessage.sender.firstName} ${selectedMessage.sender.lastName || ""}`
                      : selectedMessage.sender?.name || "Unknown"}
                  </h2>
                  <button
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDelete(selectedMessage.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-1 mb-3">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>

                <div className="bg-gray-100 rounded-lg p-4 mb-4 text-gray-800">
                  {selectedMessage.content}
                </div>

                <textarea
                  placeholder="Write a reply..."
                  className="w-full border rounded-md p-3 mb-3 h-24 focus:outline-none focus:ring-2 focus:ring-[#027906]"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                ></textarea>

                <button
                  onClick={handleReply}
                  disabled={sending}
                  className="bg-[#027906] text-[var(--text-main)] px-5 py-2 rounded-md hover:bg-[#190366] flex items-center gap-2 disabled:opacity-60"
                >
                  <FaPaperPlane /> {sending ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        loading={confirmLoading}
        title="Delete this message?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Keep"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
