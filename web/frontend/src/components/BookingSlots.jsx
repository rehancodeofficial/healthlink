import { useState, useEffect, useCallback } from "react";
import api from "../Lib/api";
import { toast } from "react-toastify";

export default function BookingSlots({ doctorId, date, onSlotSelect }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      // API expects YYYY-MM-DD
      const dateStr = date.toISOString().split("T")[0];
      const res = await api.get(`/schedule/slots?doctorId=${doctorId}&date=${dateStr}`);
      setSlots(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load slots");
    } finally {
      setLoading(false);
    }
  }, [doctorId, date]);

  useEffect(() => {
    if (doctorId && date) {
      fetchSlots();
    }
  }, [doctorId, date, fetchSlots]);

  const handleSelect = (slot) => {
    if (slot.status !== "AVAILABLE") return;
    setSelectedSlotId(slot.id);
    onSlotSelect(slot);
  };

  if (loading)
    return <div className="p-4 text-center opacity-60 animate-pulse">Loading slots...</div>;

  if (slots.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-[var(--border)] rounded-xl opacity-60">
        No slots available for this date.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
      {slots.map((slot) => {
        const startTime = new Date(slot.startTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const isAvailable = slot.status === "AVAILABLE";
        const isSelected = selectedSlotId === slot.id;

        return (
          <button
            key={slot.id}
            onClick={() => handleSelect(slot)}
            disabled={!isAvailable}
            className={`
              relative px-2 py-3 rounded-lg text-sm font-semibold transition-all border
              ${
                !isAvailable
                  ? "bg-gray-700/30 text-gray-500 border-transparent cursor-not-allowed line-through decoration-gray-500" // Booked
                  : isSelected
                    ? "bg-[var(--brand-green)] text-white border-[var(--brand-green)] shadow-[0_0_15px_rgba(2,121,6,0.5)] transform scale-105" // Selected
                    : "bg-[var(--bg-glass)] text-[var(--text-main)] border-[var(--border)] hover:border-[var(--brand-green)] hover:text-[var(--brand-green)]" // Available
              }
            `}
          >
            {startTime}
            {!isAvailable && (
              <span className="block text-[10px] uppercase font-bold mt-1 opacity-50">Booked</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
