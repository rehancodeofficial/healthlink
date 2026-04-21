// FILE: src/components/support/ui.jsx
import { FaTimes } from "react-icons/fa";

/* ========== Pills ========== */
export const StatusPill = ({ status }) => {
  const s = (status || "").toUpperCase();
  const cls =
    s === "OPEN"
      ? "bg-yellow-400 text-black"
      : s === "IN_PROGRESS"
      ? "bg-blue-600 text-white"
      : s === "RESOLVED"
      ? "bg-emerald-600 text-white"
      : s === "CLOSED"
      ? "bg-gray-500 text-white"
      : "bg-white/20 text-white";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {s || "UNKNOWN"}
    </span>
  );
};

export const PriorityPill = ({ priority }) => {
  const p = (priority || "").toUpperCase();
  const cls =
    p === "HIGH"
      ? "bg-red-600 text-white"
      : p === "MEDIUM"
      ? "bg-orange-500 text-white"
      : p === "LOW"
      ? "bg-green-600 text-white"
      : "bg-white/20 text-white";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {p || "—"}
    </span>
  );
};

/* ========== Ticket No ========== */
export const TicketNo = ({ value }) => (
  <span className="px-2 py-1 rounded bg-white/10 border border-white/20 text-xs">
    #{value?.slice(0, 8) || "—"}
  </span>
);

/* ========== Assignee Badge (NEW) ========== */
export const AssigneeBadge = ({ assignee }) => {
  // Accepts: string name OR object like { name, email }
  const name =
    typeof assignee === "string"
      ? assignee
      : assignee?.name || assignee?.email || "Unassigned";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const isUnassigned = name.toLowerCase() === "unassigned";

  return (
    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-white/10 border border-white/20 text-xs">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${isUnassigned ? "bg-gray-500" : "bg-[#027906]"}`}>
        <span className="text-white text-[10px] font-bold">{isUnassigned ? "—" : initials || "?"}</span>
      </span>
      <span className="text-white">{name}</span>
    </span>
  );
};

/* ========== Generic Modal ========== */
export const Modal = ({ open, onClose, title, children, maxWidth = "max-w-lg" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className={`relative w-full ${maxWidth} rounded-2xl bg-[#1a1a2e] p-6 shadow-xl text-white`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-gray-300 text-xl hover:text-red-400"
          aria-label="Close"
        >
          <FaTimes />
        </button>
        {title && <h2 className="text-2xl font-semibold mb-4 text-[#E2FCE3]">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

/* ========== Confirm Modal ========== */
export const ConfirmModal = ({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-md">
      <p className="text-gray-200">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded border border-white/20 hover:bg-white/10 disabled:opacity-50"
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
};

/* ========== Prompt Modal ========== */
export const PromptModal = ({
  open,
  title,
  children,
  okText = "OK",
  cancelText = "Cancel",
  onOk,
  onCancel,
  loading,
  okBtnClass = "bg-[#027906] hover:bg-[#045d07] text-white",
}) => {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-md">
      <div className="space-y-4">{children}</div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded border border-white/20 hover:bg-white/10 disabled:opacity-50"
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          onClick={onOk}
          className={`px-4 py-2 rounded ${okBtnClass} disabled:opacity-50`}
          disabled={loading}
        >
          {loading ? "Processing..." : okText}
        </button>
      </div>
    </Modal>
  );
};
