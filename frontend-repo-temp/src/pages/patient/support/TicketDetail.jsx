import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import api from "../../../Lib/api";
import {
  StatusPill,
  PriorityPill,
  TicketNo,
  ConfirmModal,
} from "../../../components/support/ui";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPaperPlane, FaArrowLeft, FaLock, FaTrashAlt } from "react-icons/fa";

export default function TicketDetails() {
  const role = "PATIENT";
  const userId = localStorage.getItem("userId") || "";
  const userName =
    localStorage.getItem("userName") || localStorage.getItem("name") || "Patient";

  const { id } = useParams(); // ticket id
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const [closing, setClosing] = useState(false);

  // delete dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/support/tickets/${id}`);
      const data = res.data?.data || res.data || {};
      setTicket(data.ticket || data);
      setReplies(data.replies || data.ticket?.replies || []);
    } catch (err) {
      console.error("Failed to load ticket:", err);
      toast.error("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const sendReply = async () => {
    if (!replyText.trim()) {
      toast.warn("Enter a reply message");
      return;
    }
    try {
      setSending(true);
      await api.post(`/support/tickets/${id}/replies`, {
        userId, // current patient
        message: replyText,
      });
      setReplyText("");
      toast.success("Reply sent");
      await fetchDetail();
    } catch (err) {
      console.error("Send reply failed:", err);
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const closeTicket = async () => {
    try {
      setClosing(true);
      await api.patch(`/support/tickets/${id}/status`, { status: "CLOSED" });
      toast.success("Ticket closed");
      await fetchDetail();
    } catch (err) {
      console.error("Close ticket failed:", err);
      toast.error("Failed to close ticket");
    } finally {
      setClosing(false);
    }
  };

  const askDelete = () => setConfirmOpen(true);

  const doDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/support/tickets/${id}`);
      toast.success("Ticket deleted");
      navigate("/patient/support");
    } catch (err) {
      console.error("Delete ticket failed:", err);
      toast.error("Failed to delete ticket");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[var(--bg-glass)] hover:bg-white/20 border border-[var(--border)]"
            >
              <FaArrowLeft /> Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={closeTicket}
                disabled={closing || ticket?.status === "CLOSED"}
                className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[#027906] hover:bg-[#045d07] disabled:opacity-60"
              >
                <FaLock />
                {closing ? "Closing..." : "Close Ticket"}
              </button>
              <button
                onClick={askDelete}
                className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-600/80 hover:bg-red-700"
              >
                <FaTrashAlt />
                Delete
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg mb-6">
            {loading || !ticket ? (
              <p className="text-[var(--text-soft)]">Loading ticket...</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-[#E2FCE3]">{ticket.subject}</h1>
                    <div className="mt-2 flex items-center gap-3 text-sm text-[var(--text-soft)]">
                      <TicketNo value={ticket.ticketNo} />
                      <span>•</span>
                      <PriorityPill priority={ticket.priority} />
                      <span>•</span>
                      <StatusPill status={ticket.status} />
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Original body */}
                <div className="mt-6 bg-[var(--bg-glass)] rounded-xl p-4">
                  <h3 className="text-[#E2FCE3] font-semibold mb-2">Description</h3>
                  <p className="text-[var(--text-soft)] whitespace-pre-wrap">{ticket.body}</p>
                </div>
              </>
            )}
          </div>

          {/* Replies */}
          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#E2FCE3]">Conversation</h3>

            {replies.length === 0 ? (
              <p className="text-[var(--text-muted)]">No replies yet.</p>
            ) : (
              <div className="space-y-4">
                {replies.map((r) => {
                  const isMine = r.userId === userId;
                  return (
                    <div
                      key={r.id}
                      className={`rounded-xl p-4 border ${
                        isMine
                          ? "bg-[#0e1a0f] border-[#1f3b21]"
                          : "bg-[#10101a] border-[#24243a]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-[var(--text-soft)]">
                          {isMine ? "You" : r.user?.name || "Support"}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-2 text-gray-100 whitespace-pre-wrap">
                        {r.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reply box */}
            <div className="mt-6">
              <textarea
                className="w-full h-28 rounded bg-[var(--bg-glass)] border border-[var(--border)] p-3 text-[var(--text-main)]"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={sendReply}
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#027906] hover:bg-[#045d07] disabled:opacity-60"
                >
                  <FaPaperPlane />
                  {sending ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirm */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Ticket?"
        message="This will permanently delete the ticket and its replies."
        confirmText="Delete"
        cancelText="Keep"
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
