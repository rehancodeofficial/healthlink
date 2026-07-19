import React from "react";

export function StatusPill({ status }) {
  const s = (status || "OPEN").toUpperCase();
  const colors = {
    OPEN: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-200",
    RESOLVED: "bg-green-100 text-green-800 border-green-200",
    CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[s] || colors.OPEN}`}>
      {s.replace("_", " ")}
    </span>
  );
}

export function PriorityPill({ priority }) {
  const p = (priority || "MEDIUM").toUpperCase();
  const colors = {
    LOW: "bg-gray-100 text-gray-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700 font-bold",
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${colors[p] || colors.MEDIUM}`}>
      {p}
    </span>
  );
}

export function TicketNo({ id }) {
  return <span className="font-mono text-xs text-gray-500">#{String(id || "").slice(-6).toUpperCase()}</span>;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl border">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
