import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";
import { Info } from "lucide-react";

const TRAVELER_FIELDS = [
  { key: "passportRequired", label: "Passport Information", description: "Travelers need to provide passport details" },
  { key: "flightInfoRequired", label: "Flight Information", description: "Travelers need to provide flight details" },
  { key: "shipInfoRequired", label: "Ship Information", description: "Travelers need to provide cruise ship details" },
  { key: "trainInfoRequired", label: "Train Information", description: "Travelers need to provide train details" },
  { key: "hotelInfoRequired", label: "Hotel Information", description: "Travelers need to provide hotel details" },
];

export default function TravelerDetailsStep() {
  const { product, updateNested } = useProductBuilderStore();
  const { content } = product;

  const toggleField = (key) => {
    updateNested(`content.${key}`, !content[key]);
  };

  const selectedCount = TRAVELER_FIELDS.filter((f) => content[f.key]).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Traveler Information Collection</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Select which details you need travelers to provide at the time of booking. This information helps you prepare for their arrival.
          </p>
        </div>
      </div>

      {selectedCount > 0 && (
        <p className="text-xs text-slate-500">
          {selectedCount} field{selectedCount !== 1 ? "s" : ""} selected
        </p>
      )}

      <div className="space-y-3">
        {TRAVELER_FIELDS.map((field) => (
          <button
            key={field.key}
            onClick={() => toggleField(field.key)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
              content[field.key]
                ? "bg-emerald-50 border-emerald-300 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
              content[field.key]
                ? "bg-emerald-600 border-emerald-600"
                : "border-slate-300"
            }`}>
              {content[field.key] && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${content[field.key] ? "text-emerald-800" : "text-slate-800"}`}>
                {field.label}
              </p>
              <p className={`text-xs mt-0.5 ${content[field.key] ? "text-emerald-600" : "text-slate-500"}`}>
                {field.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedCount === 0 && (
        <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
          <p className="text-sm text-slate-500">No traveler details selected</p>
          <p className="text-xs text-slate-400 mt-1">Toggle the options above to collect information from travelers</p>
        </div>
      )}
    </div>
  );
}
