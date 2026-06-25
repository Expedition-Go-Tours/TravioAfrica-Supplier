import { useState } from "react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";
import { Info, Plus, X, ChevronDown } from "lucide-react";

const RESELLER_TYPES = [
  { value: "official", label: "Official reseller" },
  { value: "independent", label: "Independent reseller" },
  { value: "not_reseller", label: "I am not acting as a reseller" },
];

const ACCESSIBILITY_ITEMS = [
  { key: "wheelchairAccessible", label: "Is it Wheelchair accessible?" },
  { key: "transportationWheelchairAccessible", label: "Is all transportation wheelchair accessible?" },
  { key: "surfacesWheelchairAccessible", label: "Are all surfaces wheelchair accessible (no uneven terrain, stairs, etc.)?" },
  { key: "strollerAccessible", label: "Is it stroller accessible?" },
  { key: "serviceAnimalsAllowed", label: "Are service animals allowed?", hasInfo: true },
  { key: "publicTransportation", label: "Can travelers easily arrive/depart on public transportation?" },
  { key: "infantsOnLaps", label: "Are infants required to sit on laps?" },
  { key: "infantSeatsAvailable", label: "Are infant seats available?" },
];

const DEFAULT_HEALTH_RESTRICTIONS = [
  "Not recommended for travelers with back problems",
  "Not recommended for pregnant travelers",
  "Not recommended for travelers with heart problems or other serious medical conditions",
];

const PHYSICAL_LEVELS = [
  { value: "easy", label: "Easy", description: "Most travelers can participate" },
  { value: "moderate", label: "Moderate", description: "Travelers should have a moderate physical fitness level" },
  { value: "challenging", label: "Challenging", description: "Travelers should have a strong physical fitness level" },
];

const COUNTRY_CODES = [
  { code: "+234", country: "Nigeria" },
  { code: "+27", country: "South Africa" },
  { code: "+20", country: "Egypt" },
  { code: "+254", country: "Kenya" },
  { code: "+233", country: "Ghana" },
  { code: "+256", country: "Uganda" },
  { code: "+255", country: "Tanzania" },
  { code: "+251", country: "Ethiopia" },
  { code: "+212", country: "Morocco" },
  { code: "+216", country: "Tunisia" },
  { code: "+213", country: "Algeria" },
  { code: "+243", country: "DR Congo" },
  { code: "+242", country: "Congo" },
  { code: "+225", country: "Ivory Coast" },
  { code: "+221", country: "Senegal" },
];

export default function TravelerInfoStep() {
  const { product, errors, updateNested } = useProductBuilderStore();
  const { content } = product;
  const [newRestriction, setNewRestriction] = useState("");
  const [newAccessibility, setNewAccessibility] = useState("");
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);

  const toggleAccessibility = (key) => {
    updateNested(`content.accessibility.${key}`, !content.accessibility[key]);
  };

  const addCustomAccessibility = () => {
    if (newAccessibility.trim()) {
      updateNested("content.accessibility.custom", [
        ...(content.accessibility.custom || []),
        newAccessibility.trim(),
      ]);
      setNewAccessibility("");
    }
  };

  const removeCustomAccessibility = (index) => {
    const updated = (content.accessibility.custom || []).filter((_, i) => i !== index);
    updateNested("content.accessibility.custom", updated);
  };

  const toggleHealthRestriction = (restriction) => {
    const current = content.healthRestrictions || [];
    const updated = current.includes(restriction)
      ? current.filter((r) => r !== restriction)
      : [...current, restriction];
    updateNested("content.healthRestrictions", updated);
  };

  const addCustomRestriction = () => {
    if (newRestriction.trim()) {
      updateNested("content.healthRestrictions", [
        ...(content.healthRestrictions || []),
        newRestriction.trim(),
      ]);
      setNewRestriction("");
    }
  };

  const removeCustomRestriction = (index) => {
    const updated = (content.healthRestrictions || []).filter((_, i) => i !== index);
    updateNested("content.healthRestrictions", updated);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-slate-900">
          What should travelers know before they book?
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          This information will help travelers know if this is a good activity for them.
        </p>
      </div>

      {/* General - Reseller Type */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-medium text-slate-900">General</h3>
          <p className="text-sm text-slate-500 mt-1">
            Are you acting as an official or independent reseller for your experience (or any part of it)?
          </p>
        </div>
        <div className="space-y-2">
          {RESELLER_TYPES.map((type) => (
            <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="resellerType"
                checked={content.resellerType === type.value}
                onChange={() => updateNested("content.resellerType", type.value)}
                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Accessibility */}
      <div className="space-y-4">
        <div className="flex items-center">
          <h3 className="flex-1 text-base font-medium text-slate-900">Accessibility</h3>
          <div className="flex w-[80px] justify-around">
            <span className="text-sm font-medium text-slate-600">Yes</span>
            <span className="text-sm font-medium text-slate-600">No</span>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {ACCESSIBILITY_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center py-3">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm text-slate-700">{item.label}</span>
                {item.hasInfo && (
                  <div className="relative group">
                    <Info size={14} className="text-slate-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 text-center">
                      Service animals are animals trained to perform tasks for individuals with disabilities.
                    </div>
                  </div>
                )}
              </div>
              <div className="flex w-[80px] justify-around">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name={`accessibility-${item.key}`}
                    checked={content.accessibility[item.key] === true}
                    onChange={() => updateNested(`content.accessibility.${item.key}`, true)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                </label>
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name={`accessibility-${item.key}`}
                    checked={content.accessibility[item.key] === false}
                    onChange={() => updateNested(`content.accessibility.${item.key}`, false)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>
          ))}
          
          {/* Custom Accessibility Items */}
          {(content.accessibility.custom || []).map((item, index) => (
            <div key={`custom-${index}`} className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-700">{item}</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => removeCustomAccessibility(index)}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Another Accessibility */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={newAccessibility}
            onChange={(e) => setNewAccessibility(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCustomAccessibility()}
            placeholder="Add custom accessibility question..."
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={addCustomAccessibility}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            + Add another
          </button>
        </div>
      </div>

      {/* Health Restrictions */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-medium text-slate-900">Health restrictions</h3>
          <p className="text-sm text-slate-500 mt-1">Check all that apply</p>
        </div>
        
        <div className="space-y-2">
          {DEFAULT_HEALTH_RESTRICTIONS.map((restriction) => (
            <label key={restriction} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={(content.healthRestrictions || []).includes(restriction)}
                onChange={() => toggleHealthRestriction(restriction)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{restriction}</span>
            </label>
          ))}
          
          {/* Custom Health Restrictions */}
          {(content.healthRestrictions || [])
            .filter((r) => !DEFAULT_HEALTH_RESTRICTIONS.includes(r))
            .map((restriction, index) => (
              <label key={`custom-${index}`} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => toggleHealthRestriction(restriction)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 flex-1">{restriction}</span>
                <button
                  type="button"
                  onClick={() => removeCustomRestriction(
                    (content.healthRestrictions || []).indexOf(restriction)
                  )}
                  className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </label>
            ))}
        </div>
        
        {/* Add Another Restriction */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={newRestriction}
            onChange={(e) => setNewRestriction(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCustomRestriction()}
            placeholder="Add custom health restriction..."
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={addCustomRestriction}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            + Add another
          </button>
        </div>
      </div>

      {/* Physical Difficulty Level */}
      <div className="space-y-3">
        <h3 className="text-base font-medium text-slate-900">
          Select the physical difficulty level
        </h3>
        <div className="space-y-3">
          {PHYSICAL_LEVELS.map((level) => (
            <label key={level.value} className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="physicalDifficulty"
                checked={content.physicalDifficulty === level.value}
                onChange={() => updateNested("content.physicalDifficulty", level.value)}
                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 mt-0.5"
              />
              <div>
                <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900">{level.label}</span>
                <p className="text-xs text-slate-500 mt-0.5">{level.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-medium text-slate-900">Your phone number</h3>
          <p className="text-sm text-slate-500 mt-1">
            This is the number travelers will call if they need to reach you on the day of the travel.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Country Code Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCodeDropdown(!showCodeDropdown)}
              className="flex items-center gap-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-slate-300 focus:outline-none focus:border-emerald-500"
            >
              {content.contactPhone?.countryCode || "+233"}
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {showCodeDropdown && (
              <div className="absolute z-10 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                {COUNTRY_CODES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      updateNested("content.contactPhone.countryCode", c.code);
                      setShowCodeDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>{c.code}</span>
                    <span className="text-xs text-slate-400">{c.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Phone Number Input */}
          <input
            type="tel"
            value={content.contactPhone?.number || ""}
            onChange={(e) => updateNested("content.contactPhone.number", e.target.value)}
            placeholder="025 667 4138"
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
