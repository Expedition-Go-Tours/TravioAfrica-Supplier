import { useState } from "react";
import { Plus, X, ExternalLink } from "lucide-react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

function EditableList({ label, items, onChange, error }) {
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (index) => {
    setEditIndex(index);
    setEditValue(items[index]);
  };

  const saveEdit = (index) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const next = [...items];
    next[index] = trimmed;
    onChange(next);
    setEditIndex(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditValue("");
  };

  const addItem = () => {
    onChange([...items, ""]);
    setEditIndex(items.length);
    setEditValue("");
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
    if (editIndex === index) cancelEdit();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(index);
    }
    if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-800">{label}</h3>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {editIndex === index ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onBlur={() => saveEdit(index)}
                  autoFocus
                  placeholder="Enter item..."
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => saveEdit(index)}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 shrink-0"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs text-slate-400 hover:text-slate-600 shrink-0"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = e.target.value;
                    onChange(next);
                  }}
                  placeholder="Enter item..."
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
      >
        <Plus size={16} strokeWidth={2.5} />
        Add an {label.toLowerCase()}
      </button>
    </div>
  );
}

export default function InclusionsExclusionsStep() {
  const { product, errors, updateNested } = useProductBuilderStore();
  const { content } = product;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-slate-900">
          What is and isn&apos;t included?
        </h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          List everything included and excluded from the price. Specify any additional costs
          travelers will need to pay in-destination, such as special equipment and admission fees.
        </p>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 mt-2"
        >
          See examples
          <ExternalLink size={14} />
        </a>
      </div>

      <EditableList
        label="What's included"
        items={content.included || []}
        onChange={(items) => updateNested("content.included", items)}
        error={errors.included}
      />

      <EditableList
        label="What's excluded"
        items={content.excluded || []}
        onChange={(items) => updateNested("content.excluded", items)}
        error={errors.excluded}
      />

      <label className="flex items-start gap-3 cursor-pointer pt-2">
        <input
          type="checkbox"
          checked={content.inclusionsConfirmed || false}
          onChange={(e) => updateNested("content.inclusionsConfirmed", e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600/20 mt-0.5"
        />
        <span className="text-sm text-slate-600 leading-relaxed">
          I confirm that the information provided above is an accurate reflection of all additional
          costs that may apply, including all mandatory fees (if any) that are required to be paid
          to third parties in-destination by the travelers who book my experience.
        </span>
      </label>
      {errors.inclusionsConfirmed && (
        <p className="text-xs text-red-500">{errors.inclusionsConfirmed}</p>
      )}
    </div>
  );
}
