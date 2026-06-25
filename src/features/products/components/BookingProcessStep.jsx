import { useState } from "react";
import { Clock, Users, CalendarDays, Plus, X, Info } from "lucide-react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

const CONFIRMATION_TYPES = [
  { value: "instant", label: "Instant Confirmation", description: "Bookings are confirmed immediately without manual approval" },
  { value: "manual", label: "Manual Confirmation", description: "You review and approve each booking request" },
  { value: "hybrid", label: "Hybrid", description: "Instant confirmation up to a limit, then manual review" },
];

const DAYS = [
  { key: "monday", short: "Mon", full: "Monday" },
  { key: "tuesday", short: "Tue", full: "Tuesday" },
  { key: "wednesday", short: "Wed", full: "Wednesday" },
  { key: "thursday", short: "Thu", full: "Thursday" },
  { key: "friday", short: "Fri", full: "Friday" },
  { key: "saturday", short: "Sat", full: "Saturday" },
  { key: "sunday", short: "Sun", full: "Sunday" },
];

export default function BookingProcessStep() {
  const { product, errors, updateNested } = useProductBuilderStore();
  const { bookingRules, schedule } = product;
  const [showCutoffInfo, setShowCutoffInfo] = useState(false);

  const toggleDay = (day) => {
    const current = schedule.operatingDays || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    updateNested("schedule.operatingDays", updated);
  };

  const selectAllDays = () => {
    updateNested("schedule.operatingDays", DAYS.map(d => d.key));
  };

  const clearAllDays = () => {
    updateNested("schedule.operatingDays", []);
  };

  const addTimeSlot = () => {
    const slots = [...(schedule.timeSlots || []), { startTime: "09:00", endTime: "12:00" }];
    updateNested("schedule.timeSlots", slots);
  };

  const updateTimeSlot = (index, field, value) => {
    const slots = [...(schedule.timeSlots || [])];
    slots[index] = { ...slots[index], [field]: value };
    updateNested("schedule.timeSlots", slots);
  };

  const removeTimeSlot = (index) => {
    const slots = (schedule.timeSlots || []).filter((_, i) => i !== index);
    updateNested("schedule.timeSlots", slots);
  };

  const formatTime12h = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const selectedDaysCount = (schedule.operatingDays || []).length;

  return (
    <div className="space-y-8">
      {/* Confirmation Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-slate-900">Confirmation Settings</h3>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Confirmation Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CONFIRMATION_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => updateNested("bookingRules.confirmationType", type.value)}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  bookingRules.confirmationType === type.value
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    bookingRules.confirmationType === type.value
                      ? "border-emerald-600"
                      : "border-slate-300"
                  }`}>
                    {bookingRules.confirmationType === type.value && (
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${
                    bookingRules.confirmationType === type.value
                      ? "text-emerald-700"
                      : "text-slate-800"
                  }`}>
                    {type.label}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${
                  bookingRules.confirmationType === type.value
                    ? "text-emerald-600"
                    : "text-slate-500"
                }`}>
                  {type.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Booking Cut-off</label>
              <button
                type="button"
                onClick={() => setShowCutoffInfo(!showCutoffInfo)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <Info size={14} />
              </button>
            </div>
            {showCutoffInfo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                This is the minimum time before a tour starts that travelers can book. For example, 24 hours means travelers must book at least 1 day in advance.
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={schedule.bookingCutoffHours}
                onChange={(e) => updateNested("schedule.bookingCutoffHours", Number(e.target.value))}
                min="0"
                placeholder="24"
                className={`flex-1 px-4 py-2.5 border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                  errors.minAdvanceBookingHours ? "border-red-500" : "border-slate-200"
                }`}
              />
              <span className="text-sm text-slate-500">hours before</span>
            </div>
            {errors.minAdvanceBookingHours && (
              <p className="text-xs text-red-500">{errors.minAdvanceBookingHours}</p>
            )}
          </div>
        </div>
      </div>

      {/* Group Size */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-slate-900">Group Size</h3>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Minimum</label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={bookingRules.minGroupSize}
                  onChange={(e) => updateNested("bookingRules.minGroupSize", Number(e.target.value))}
                  min="1"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Maximum</label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={bookingRules.maxGroupSize}
                  onChange={(e) => updateNested("bookingRules.maxGroupSize", Number(e.target.value))}
                  min="1"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Per Time Slot</label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={schedule.capacityPerSlot}
                  onChange={(e) => updateNested("schedule.capacityPerSlot", Number(e.target.value))}
                  min="1"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operating Days */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-slate-900">Operating Days</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{selectedDaysCount} days</span>
            <button
              type="button"
              onClick={selectedDaysCount === 7 ? clearAllDays : selectAllDays}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {selectedDaysCount === 7 ? "Clear all" : "Select all"}
            </button>
          </div>
        </div>

        {errors.operatingDays && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{errors.operatingDays}</p>
          </div>
        )}

        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => {
            const isSelected = (schedule.operatingDays || []).includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-sm font-semibold">{day.short}</span>
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  isSelected ? "bg-emerald-600" : "bg-slate-200"
                }`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-slate-900">Time Slots</h3>
          <button
            type="button"
            onClick={addTimeSlot}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <Plus size={16} />
            Add Slot
          </button>
        </div>

        {(!schedule.timeSlots || schedule.timeSlots.length === 0) ? (
          <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
            <Clock size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">No time slots added</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Slot" to create your first time slot</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(schedule.timeSlots || []).map((slot, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-emerald-700">{index + 1}</span>
                </div>
                
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Start</label>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateTimeSlot(index, "startTime", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  
                  <div className="pt-6">
                    <span className="text-slate-300">→</span>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">End</label>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateTimeSlot(index, "endTime", e.target.value)}
                      min={slot.startTime || undefined}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {slot.startTime && formatTime12h(slot.startTime)} - {slot.endTime && formatTime12h(slot.endTime)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(index)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
