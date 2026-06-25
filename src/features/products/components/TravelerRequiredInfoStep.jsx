import { Info } from "lucide-react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

const INFO_FIELDS = [
  { key: "fullName", label: "Full Name", description: "Traveler's full legal name" },
  { key: "dateOfBirth", label: "Date of Birth", description: "Traveler's date of birth for age verification" },
  { key: "nationality", label: "Nationality", description: "Traveler's country of citizenship" },
  { key: "passport", label: "Passport Number", description: "Passport or ID document number" },
  { key: "phone", label: "Phone Number", description: "Contact phone number for emergencies" },
  { key: "email", label: "Email Address", description: "Email for booking confirmation" },
];

export default function TravelerRequiredInfoStep() {
  const { product, updateNested } = useProductBuilderStore();
  const selected = product.bookingRules.travelerRequiredInfo || [];

  const toggleField = (key) => {
    const updated = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    updateNested("bookingRules.travelerRequiredInfo", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Traveler Information to Collect</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Select which details travelers must provide at the time of booking.
          </p>
        </div>
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-slate-500">{selected.length} field{selected.length !== 1 ? "s" : ""} selected</p>
      )}

      <div className="space-y-2">
        {INFO_FIELDS.map((field) => (
          <button
            key={field.key}
            onClick={() => toggleField(field.key)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
              selected.includes(field.key)
                ? "bg-emerald-50 border-emerald-300 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
              selected.includes(field.key)
                ? "bg-emerald-600 border-emerald-600"
                : "border-slate-300"
            }`}>
              {selected.includes(field.key) && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${selected.includes(field.key) ? "text-emerald-800" : "text-slate-800"}`}>
                {field.label}
              </p>
              <p className={`text-xs mt-0.5 ${selected.includes(field.key) ? "text-emerald-600" : "text-slate-500"}`}>
                {field.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selected.length === 0 && (
        <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
          <p className="text-sm text-slate-500">No fields selected</p>
          <p className="text-xs text-slate-400 mt-1">Select the information you need from travelers at booking</p>
        </div>
      )}
    </div>
  );
}
