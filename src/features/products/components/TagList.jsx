import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function TagList({ label, items, placeholder, onChange }) {
  const [inputValue, setInputValue] = useState("");

  const addItem = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setInputValue("");
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
      </div>
      <div className="p-5">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none"
          />
          <button
            type="button"
            onClick={addItem}
            disabled={!inputValue.trim()}
            className="flex items-center justify-center gap-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {items.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {items.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <span className="text-sm text-slate-700 truncate">{item}</span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && (
          <div className="mt-4 flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-sm text-slate-500 text-center">No items added yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Type above and press Enter or click Add</p>
          </div>
        )}
      </div>
    </div>
  );
}
