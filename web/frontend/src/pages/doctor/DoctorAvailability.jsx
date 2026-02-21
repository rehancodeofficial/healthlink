import { useState, useEffect } from "react";
import api from "../../Lib/api";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Helper to format date as YYYY-MM-DD for API
const formatDate = (date) => date.toISOString().split("T")[0];

export default function DoctorAvailability() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Default: 9 AM to 5 PM
  const [startTime, setStartTime] = useState(new Date(new Date().setHours(9, 0, 0, 0)));
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(17, 0, 0, 0)));

  const [slotDuration, setSlotDuration] = useState(15);
  const [loading, setLoading] = useState(false);
  const [slotsPreview, setSlotsPreview] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  const doctorId = localStorage.getItem("userId"); // Assuming doctor is logged in

  // Preview Logic (Client-side estimation)
  useEffect(() => {
    if (startTime >= endTime) {
      setSlotsPreview([]);
      return;
    }

    // Simulate slot generation
    const slots = [];
    let current = new Date(startTime);
    const stop = new Date(endTime);

    // Adjust dates to match selectedDate purely for display if needed,
    // but here we just care about time chunks
    let count = 0;
    while (current < stop) {
      const next = new Date(current.getTime() + slotDuration * 60000);
      if (next > stop) break;
      slots.push({
        start: current.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        end: next.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      current = next;
      count++;
      if (count > 100) break; // Safety break
    }
    setSlotsPreview(slots);
  }, [startTime, endTime, slotDuration]);

  const handleSave = async () => {
    if (!doctorId) {
      toast.error("Doctor ID not found. Please relogin.");
      return;
    }
    setLoading(true);
    setIsSaved(false);

    try {
      // 1. Construct payload
      // Ideally, combine selectedDate with startTime/endTime hours
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(startTime.getHours(), startTime.getMinutes());

      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes());

      const payload = {
        doctorId,
        date: formatDate(selectedDate),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        slotDuration: Number(slotDuration),
      };

      const res = await api.post("/doctor-schedule/availability", payload);

      if (res.data.success) {
        toast.success(`Availability set! Generated ${res.data.count} slots.`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-[var(--text-main)]">
      <h1 className="text-3xl font-bold mb-6">Manage Availability</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Settings Card */}
        <div className="bg-[var(--bg-glass)] border border-[var(--border)] p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-[var(--brand-green)]">Set Schedule</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 opacity-70">Select Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minDate={new Date()}
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">Start Time</label>
              <DatePicker
                selected={startTime}
                onChange={(date) => setStartTime(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Start"
                dateFormat="h:mm aa"
                className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 opacity-70">End Time</label>
              <DatePicker
                selected={endTime}
                onChange={(date) => setEndTime(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="End"
                dateFormat="h:mm aa"
                className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 opacity-70">
              Slot Duration (Minutes)
            </label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-main)]"
            >
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>1 Hour</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-[var(--brand-green)] hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Slots"}
          </button>
        </div>

        {/* Preview Card */}
        <div className="bg-[var(--bg-glass)] border border-[var(--border)] p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <h2 className="text-xl font-semibold mb-4 text-[var(--brand-blue)]">
            Slot Preview ({slotsPreview.length})
          </h2>

          <div className="max-h-[400px] overflow-y-auto grid grid-cols-2 gap-2 pr-2 custom-scrollbar">
            {slotsPreview.length === 0 ? (
              <p className="text-sm opacity-50 col-span-2 text-center py-10">
                No slots generated. Check times.
              </p>
            ) : (
              slotsPreview.map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--bg-main)] border border-[var(--border)] p-2 rounded text-center text-xs font-mono opacity-80"
                >
                  {slot.start} - {slot.end}
                </div>
              ))
            )}
          </div>

          {isSaved && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center fade-in">
              <div className="bg-[var(--brand-green)] text-white px-6 py-3 rounded-xl font-bold shadow-2xl animate-bounce">
                ✅ Saved Successfully!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
