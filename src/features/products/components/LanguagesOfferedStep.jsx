import { useState } from "react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";
import { Search, Check, X } from "lucide-react";

const LANGUAGES = [
  "English", "French", "German", "Spanish", "Italian", "Portuguese", "Dutch", "Russian",
  "Chinese", "Japanese", "Korean", "Arabic", "Swahili", "Hindi", "Thai", "Vietnamese",
  "Indonesian", "Turkish", "Greek", "Polish", "Swedish", "Norwegian", "Danish", "Finnish",
];

const GUIDE_TYPES = [
  { value: "official", label: "Official" },
  { value: "independent", label: "Independent" },
  { value: "none", label: "I do not have in-person guides" },
];

export default function LanguagesOfferedStep() {
  const { product, errors, updateNested } = useProductBuilderStore();
  const { content } = product;
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !content.languages.includes(lang)
  );

  const addLanguage = (lang) => {
    if (!content.languages.includes(lang)) {
      updateNested("content.languages", [...content.languages, lang]);
    }
    setSearchTerm("");
    setIsOpen(false);
  };

  const removeLanguage = (lang) => {
    updateNested(
      "content.languages",
      content.languages.filter((l) => l !== lang)
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-slate-900">
          Tell us about the guides provided
        </h2>
      </div>

      {/* Does a guide lead your activity? */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-800">
            Does a guide lead your activity?
          </label>
          <p className="text-xs text-slate-500 mt-1">
            e.g. tour guide, instructor, group leader, chef, etc.
          </p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasGuideLead"
              checked={content.hasGuideLead === true}
              onChange={() => updateNested("content.hasGuideLead", true)}
              className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasGuideLead"
              checked={content.hasGuideLead === false}
              onChange={() => updateNested("content.hasGuideLead", false)}
              className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">No</span>
          </label>
        </div>
      </div>

      {/* Conditional fields when guide leads activity */}
      {content.hasGuideLead && (
        <>
          {/* Language Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-800">
              Choose the languages you can accommodate
            </label>
            
            {/* Selected Languages */}
            {(content.languages || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {content.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="p-0.5 hover:bg-emerald-100 rounded-full transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Search languages..."
                className={`w-full px-4 py-2.5 pr-10 border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all ${
                  errors.languages ? "border-red-400" : "border-slate-200/80 hover:border-slate-300"
                }`}
              />
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              
              {/* Dropdown */}
              {isOpen && filteredLanguages.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => addLanguage(lang)}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors"
                    >
                      {lang}
                      <Check size={14} className="text-emerald-600 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {errors.languages && (
              <p className="text-xs text-red-500">{errors.languages}</p>
            )}
          </div>

          {/* Guide Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-800">
              Are your in-person guides official or independent?
            </label>
            <div className="space-y-2">
              {GUIDE_TYPES.map((type) => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="guideType"
                    checked={content.guideType === type.value}
                    onChange={() => updateNested("content.guideType", type.value)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
