// FILE: src/pages/superadmin/ActivityLogs.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../Lib/api";
import {
  FaUser,
  FaClock,
  FaTasks,
  FaFilter,
  FaFileCsv,
  FaFilePdf,
  FaTerminal,
  FaDownload,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaCircle,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    actorId: "",
    action: "",
    startDate: "",
    endDate: "",
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  const [quickFilter, setQuickFilter] = useState("");

  const role = localStorage.getItem("role") || "SUPERADMIN";
  const userName =
    localStorage.getItem("userName") || localStorage.getItem("name") || "Super Admin";

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/superadmin/activity-logs", { params: filters });
      setLogs(res.data || []);
      setTotalLogs(res.data?.length || 0);
      setLastRefresh(new Date());
    } catch (err) {
      toast.error("Telemetry Error: Failed to sync activity logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, filters]);

  // Quick filter presets
  const applyQuickFilter = (preset) => {
    const now = new Date();
    let newFilters = { ...filters };

    switch (preset) {
      case "lastHour":
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        newFilters.startDate = oneHourAgo.toISOString().split("T")[0];
        newFilters.endDate = now.toISOString().split("T")[0];
        break;
      case "today":
        newFilters.startDate = now.toISOString().split("T")[0];
        newFilters.endDate = now.toISOString().split("T")[0];
        break;
      case "failedLogins":
        newFilters.action = "LOGIN_FAILED";
        break;
      case "adminActions":
        newFilters.role = "SUPERADMIN";
        break;
      case "clear":
        newFilters = { role: "", actorId: "", action: "", startDate: "", endDate: "" };
        break;
    }

    setFilters(newFilters);
    setQuickFilter(preset);
  };

  // Security alert detection
  const getSecurityLevel = (log) => {
    const action = log.action?.toLowerCase() || "";
    if (
      action.includes("failed") ||
      action.includes("unauthorized") ||
      action.includes("blocked")
    ) {
      return "high";
    }
    if (action.includes("delete") || action.includes("remove") || action.includes("update")) {
      return "medium";
    }
    return "low";
  };

  const getSecurityColor = (level) => {
    switch (level) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-[var(--text-muted)]";
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const exportCSV = () => {
    if (!logs.length) return toast.error("No telemetry data to export.");
    const headers = ["Actor ID", "Role", "Action", "Entity", "Time"];
    const rows = logs.map((log) => [
      log.actorId,
      log.actorRole,
      log.action,
      log.entity,
      new Date(log.createdAt).toLocaleString(),
    ]);
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "system_audit_trail.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (!logs.length) return toast.error("No telemetry data to export.");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("CureVirtual - System Audit Trail", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Logs: ${totalLogs}`, 14, 34);
    const tableColumn = ["Actor ID", "Role", "Action", "Entity", "Time", "Risk"];
    const tableRows = logs.map((log) => [
      log.actorId,
      log.actorRole,
      log.action,
      log.entity,
      new Date(log.createdAt).toLocaleString(),
      getSecurityLevel(log).toUpperCase(),
    ]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8, font: "helvetica" },
      headStyles: { fillColor: [2, 121, 6] },
    });
    doc.save("system_audit_trail.pdf");
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.4em] mb-1">
              Security Intelligence
            </h2>
            <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-4">
              <FaTerminal className="text-[var(--brand-blue)]" /> Security Flux
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <FaCircle
                  className={`text-[6px] ${autoRefresh ? "text-green-500 animate-pulse" : "text-gray-500"}`}
                />
                <span className="text-[10px] font-bold text-[var(--text-muted)]">
                  {autoRefresh ? "LIVE MONITORING" : "MANUAL MODE"}
                </span>
              </div>
              {lastRefresh && (
                <span className="text-[10px] font-bold text-[var(--text-muted)]">
                  Last Update: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
              <span className="text-[10px] font-bold text-[var(--brand-green)]">
                {totalLogs} Total Logs
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`btn glass px-6 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                autoRefresh
                  ? "bg-[var(--brand-green)] text-white"
                  : "hover:bg-[var(--brand-green)] hover:text-white"
              }`}
            >
              <FaSync className={autoRefresh ? "animate-spin" : ""} />{" "}
              {autoRefresh ? "Live" : "Auto-Refresh"}
            </button>
            <button
              onClick={fetchLogs}
              className="btn glass px-6 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all"
            >
              <FaSync /> Refresh
            </button>
            <button
              onClick={exportCSV}
              className="btn glass px-6 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-[var(--brand-green)] hover:text-[var(--text-main)] transition-all"
            >
              <FaFileCsv /> CSV
            </button>
            <button
              onClick={exportPDF}
              className="btn glass px-6 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all"
            >
              <FaFilePdf /> PDF
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => applyQuickFilter("today")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              quickFilter === "today"
                ? "bg-[var(--brand-blue)] text-white"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--brand-blue)] hover:text-white"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => applyQuickFilter("lastHour")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              quickFilter === "lastHour"
                ? "bg-[var(--brand-blue)] text-white"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--brand-blue)] hover:text-white"
            }`}
          >
            Last Hour
          </button>
          <button
            type="button"
            onClick={() => applyQuickFilter("failedLogins")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              quickFilter === "failedLogins"
                ? "bg-red-500 text-white"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-red-500 hover:text-white"
            }`}
          >
            Failed Logins
          </button>
          <button
            type="button"
            onClick={() => applyQuickFilter("adminActions")}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              quickFilter === "adminActions"
                ? "bg-[var(--brand-green)] text-white"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--brand-green)] hover:text-white"
            }`}
          >
            Admin Actions
          </button>
          <button
            type="button"
            onClick={() => applyQuickFilter("clear")}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-gray-500 hover:text-[var(--text-main)] transition-all"
          >
            Clear Filters
          </button>
        </div>

        <form
          onSubmit={handleFilter}
          className="card glass !p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
              Clearance Tier
            </label>
            <select
              name="role"
              value={filters.role}
              onChange={handleChange}
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 text-xs font-black text-black outline-none focus:border-[var(--brand-blue)]"
            >
              <option value="">All Credentials</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPPORT">SUPPORT</option>
              <option value="DOCTOR">DOCTOR</option>
              <option value="PATIENT">PATIENT</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
              Subject ID
            </label>
            <input
              type="text"
              name="actorId"
              placeholder="Input ID..."
              value={filters.actorId}
              onChange={handleChange}
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 text-xs font-bold text-[var(--text-main)] outline-none focus:border-[var(--brand-blue)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
              Operation Code
            </label>
            <input
              type="text"
              name="action"
              placeholder="Action..."
              value={filters.action}
              onChange={handleChange}
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 text-xs font-bold text-[var(--text-main)] outline-none focus:border-[var(--brand-blue)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
              Start Interval
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 text-xs font-bold text-[var(--text-main)] outline-none focus:border-[var(--brand-blue)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
              End Interval
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 text-xs font-bold text-[var(--text-main)] outline-none focus:border-[var(--brand-blue)]"
            />
          </div>
          <button
            type="submit"
            className="lg:col-span-5 btn btn-primary py-4 text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-[var(--brand-blue)]/20"
          >
            Apply Filter Parameters
          </button>
        </form>

        <div className="card !p-0 overflow-hidden border border-[var(--border)] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Subject
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Clearance
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Operation
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Entity Identifier
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Time Matrix
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Risk Level
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-8 py-12 text-center text-sm font-bold text-[var(--text-soft)] animate-pulse uppercase tracking-[0.2em]"
                    >
                      Intercepting Data Flux...
                    </td>
                  </tr>
                ) : currentLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-8 py-12 text-center text-sm font-bold text-[var(--text-soft)] uppercase tracking-[0.2em]"
                    >
                      No Activity Logs Recorded.
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => {
                    const securityLevel = getSecurityLevel(log);
                    const securityColor = getSecurityColor(securityLevel);
                    return (
                      <tr
                        key={log.id}
                        className={`hover:bg-white/5 transition-colors ${
                          securityLevel === "high" ? "bg-red-500/5 border-l-4 border-l-red-500" : ""
                        }`}
                      >
                        <td className="px-8 py-5 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[var(--bg-glass)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                            <FaUser size={12} />
                          </div>
                          <span className="text-sm font-black text-[var(--text-main)] uppercase tracking-tight">
                            {log.actorId}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 rounded-full bg-[var(--bg-main)] border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--brand-blue)]">
                            {log.actorRole}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <FaTasks className="text-[var(--brand-green)] opacity-50" />
                            <span className="text-xs font-bold text-[var(--text-main)]">
                              {log.action}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-[var(--text-soft)] italic">
                          {log.entity}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-[var(--text-muted)]">
                            <FaClock size={11} />
                            <span className="text-[10px] font-black uppercase tracking-tight">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            {securityLevel === "high" && (
                              <FaExclamationTriangle className={securityColor} />
                            )}
                            {securityLevel === "medium" && (
                              <FaExclamationTriangle className={securityColor} />
                            )}
                            {securityLevel === "low" && <FaCheckCircle className={securityColor} />}
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest ${securityColor}`}
                            >
                              {securityLevel}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card glass !p-6 flex items-center justify-between">
            <div className="text-sm font-bold text-[var(--text-muted)]">
              Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, logs.length)} of{" "}
              {logs.length} logs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronLeft />
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                        currentPage === pageNum
                          ? "bg-[var(--brand-blue)] text-white"
                          : "bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--brand-blue)] hover:text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return (
                    <span key={pageNum} className="px-2 text-[var(--text-muted)]">
                      ...
                    </span>
                  );
                }
                return null;
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
