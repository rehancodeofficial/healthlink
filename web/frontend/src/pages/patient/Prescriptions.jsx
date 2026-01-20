// FILE: src/pages/patient/PatientPrescriptions.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import api from "../../Lib/api";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { FaEye, FaDownload } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");
  const patientUserId = localStorage.getItem("userId"); // ✅ This is User.id

  // For PDF capture
  const pdfRef = useRef(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  // Simple inline placeholder logo (SVG → data URI)
  const PLACEHOLDER_LOGO =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='50'>
        <rect width='200' height='50' fill='#027906'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
              font-size='16' font-family='Arial, Helvetica, sans-serif'
              fill='white'>CureVirtual</text>
      </svg>`
    );

  // --------------------------------------------------------
  // Fetch prescriptions for the logged-in patient
  // --------------------------------------------------------
  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patient/prescriptions?patientId=${patientUserId}`);
      setPrescriptions(res.data || []);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  }, [patientUserId]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleView = (prescription) => {
    setSelectedPrescription(prescription);
    setModalOpen(true);
  };

  // --------------------------------------------------------
  // Download PDF (html2canvas + jsPDF)
  // --------------------------------------------------------
  const handleDownloadPdf = async () => {
    if (!pdfRef.current || !selectedPrescription) return;
    try {
      setPdfBusy(true);

      // Lazy-load to keep main bundle smaller
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Capture the node
      const canvas = await html2canvas(pdfRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // sharper
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fit image to width, maintain aspect
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - 20; // 10mm margins
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // Header
      pdf.setFillColor(2, 121, 6); // #027906
      pdf.rect(0, 0, pageWidth, 22, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text("CureVirtual — Prescription", 10, 14);

      // Footer
      const footerY = pageHeight - 10;
      pdf.setTextColor(120);
      pdf.setFontSize(9);
      pdf.text(`Generated ${new Date().toLocaleString()}`, 10, footerY);

      // Body image
      pdf.addImage(imgData, "PNG", 10, 26, imgWidth, Math.min(imgHeight, pageHeight - 36));

      const filenameSafeMed =
        (selectedPrescription.medication || "prescription").toString().replace(/[^a-z0-9_-]+/gi, "_");
      pdf.save(`${filenameSafeMed}.pdf`);
    } catch (e) {
      console.error("PDF export failed:", e);
      toast.error("Failed to export PDF");
    } finally {
      setPdfBusy(false);
    }
  };

  // --------------------------------------------------------
  // UI Rendering
  // --------------------------------------------------------
  return (
    <div className="flex bg-[var(--bg-main)]/90 text-[var(--text-main)] min-h-screen">
      <Sidebar role={role || "PATIENT"} />
      <div className="flex-1 p-6">
        <Topbar userName={userName} />

        <div className="flex justify-between items-center mb-6">
                          <img
                    src="/images/logo/Asset3.png"
                    alt="CureVirtual"
                    style={{ width: 120, height: "auto" }}
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_LOGO; }} // fallback if missing
                  />
          <h1 className="text-3xl font-bold">My Prescriptions</h1>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {loading ? (
          <p>Loading prescriptions...</p>
        ) : (
          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Medication</th>
                  <th className="p-3">Dosage</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.length > 0 ? (
                  prescriptions.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--bg-glass)] transition"
                    >
                      <td className="p-3">{p.doctor?.user?.name || "N/A"}</td>
                      <td className="p-3">{p.medication}</td>
                      <td className="p-3">{p.dosage}</td>
                      <td className="p-3">{p.frequency}</td>
                      <td className="p-3">{p.duration}</td>
                      <td className="p-3">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="p-3 flex justify-center gap-4">
                        <button
                          onClick={() => handleView(p)}
                          className="hover:scale-110 transition"
                          title="View"
                        >
                          <FaEye className="text-[#FFFFFF]" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-[var(--text-muted)]">
                      No prescriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== MODAL (View + Download) ===== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-main)]/95 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-xl w-full max-w-lg relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-4 text-[var(--text-soft)] text-xl"
            >
              ✖
            </button>
                <img
                    src="/images/logo/Asset3.png"
                    alt="CureVirtual"
                    style={{ width: 120, height: "auto" }}
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_LOGO; }} // fallback if missing
                  />
            <h2 className="text-2xl font-semibold mb-4 text-[var(--text-main)]">
              Prescription Details
            </h2>

            {/* Export Target */}
            <div
              ref={pdfRef}
              className="space-y-3 bg-white rounded-xl p-5 text-[#111827]"
            >
              {/* Header in exported area (light mode for print quality) */}
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/logo/Asset3.png"
                    alt="CureVirtual"
                    style={{ width: 120, height: "auto" }}
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_LOGO; }} // fallback if missing
                  />
                  <div>
                    <h3 className="text-lg font-bold">Prescription</h3>
                    <p className="text-sm text-gray-600">
                      Issued:{" "}
                      {selectedPrescription?.createdAt
                        ? new Date(selectedPrescription.createdAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    Dr:{" "}
                    <span className="font-semibold">
                      {selectedPrescription?.doctor?.user?.name || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <p>
                  <span className="font-semibold">Patient:</span>{" "}
                  {selectedPrescription?.patient?.user?.name || "—"}
                </p>
                <p>
                  <span className="font-semibold">Patient ID:</span>{" "}
                  {selectedPrescription?.patient?.userId || "—"}
                </p>

                <p>
                  <span className="font-semibold">Medication:</span>{" "}
                  {selectedPrescription?.medication}
                </p>
                <p>
                  <span className="font-semibold">Dosage:</span>{" "}
                  {selectedPrescription?.dosage}
                </p>
                <p>
                  <span className="font-semibold">Frequency:</span>{" "}
                  {selectedPrescription?.frequency}
                </p>
                <p>
                  <span className="font-semibold">Duration:</span>{" "}
                  {selectedPrescription?.duration}
                </p>

                {/* Extra rows (render only if present) */}
                {selectedPrescription?.diagnosis && (
                  <p>
                    <span className="font-semibold">Diagnosis:</span>{" "}
                    {selectedPrescription.diagnosis}
                  </p>
                )}
                {selectedPrescription?.route && (
                  <p>
                    <span className="font-semibold">Route:</span>{" "}
                    {selectedPrescription.route}
                  </p>
                )}
                {selectedPrescription?.refills != null && (
                  <p>
                    <span className="font-semibold">Refills:</span>{" "}
                    {selectedPrescription.refills}
                  </p>
                )}
                {(selectedPrescription?.startDate || selectedPrescription?.endDate) && (
                  <p>
                    <span className="font-semibold">Course:</span>{" "}
                    {selectedPrescription.startDate
                      ? new Date(selectedPrescription.startDate).toLocaleDateString()
                      : "—"}{" "}
                    —{" "}
                    {selectedPrescription.endDate
                      ? new Date(selectedPrescription.endDate).toLocaleDateString()
                      : "—"}
                  </p>
                )}
                {selectedPrescription?.instructions && (
                  <p>
                    <span className="font-semibold">Instructions:</span>{" "}
                    {selectedPrescription.instructions}
                  </p>
                )}

                <p>
                  <span className="font-semibold">Notes:</span>{" "}
                  {selectedPrescription?.notes || "—"}
                </p>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500">
                  *This document is generated electronically and valid without signature.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={handleDownloadPdf}
                disabled={pdfBusy}
                className="inline-flex items-center gap-2 bg-[#027906] hover:bg-[#045d07] text-[var(--text-main)] px-4 py-2 rounded-md transition disabled:opacity-60"
              >
                <FaDownload />
                {pdfBusy ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
