import { Info } from "lucide-react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

function inputCls(error) {
  return `w-full px-4 py-2.5 border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all ${
    error ? "border-red-400" : "border-slate-200/80 hover:border-slate-300"
  }`;
}

export default function USPStep() {
  const { product, errors, updateNested } = useProductBuilderStore();
  const { content } = product;
  const text = content.uniqueSellingPoints || "";
  const chars = text.trim().length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-slate-900">
          What sets your activity apart?
        </h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Encourage travelers to book your activity by highlighting what makes it unique and interesting.
        </p>
      </div>

      {/* Textarea */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => updateNested("content.uniqueSellingPoints", e.target.value)}
          rows={6}
          placeholder="Our tour is the only one that offers..."
          className={`${inputCls(errors.uniqueSellingPoints)} resize-none`}
        />
        {errors.uniqueSellingPoints && (
          <p className="text-xs text-red-500">{errors.uniqueSellingPoints}</p>
        )}
        <div className="flex justify-end">
          {chars < 100 ? (
            <span className="text-xs text-slate-400">
              {100 - chars} characters needed
            </span>
          ) : (
            <span className="text-xs text-emerald-600">
              {chars} characters
            </span>
          )}
        </div>
      </div>

      {/* Private Activity */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-800">
            Is this a private activity?
          </label>
          <div className="relative group">
            <Info size={14} className="text-slate-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-56 text-center whitespace-normal">
              A private activity means only your group will participate, with no other travelers.
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => updateNested("content.isPrivateActivity", true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              content.isPrivateActivity
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:border-slate-300"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => updateNested("content.isPrivateActivity", false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              !content.isPrivateActivity
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:border-slate-300"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Max Travelers - only show when NOT private activity */}
      {!content.isPrivateActivity && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-800 mb-2 block">
            Enter the maximum number of travelers who can participate
          </label>
          <input
            type="number"
            min={1}
            value={content.maxTravelers}
            onChange={(e) => updateNested("content.maxTravelers", Number(e.target.value))}
            className={`${inputCls()} max-w-[200px]`}
          />
          <p className="text-xs text-slate-500 mt-2">
            Before you can update your new maximum number here, you'll need to reduce your tiered pricing booking limit under the Schedules & prices tab.
          </p>
        </div>
      )}
    </div>
  );
}
