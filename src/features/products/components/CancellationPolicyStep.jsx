import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

export default function CancellationPolicyStep() {
  const { product, updateProduct } = useProductBuilderStore();
  const isStandard = product.cancellationPolicy !== "non-refundable";

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-800 mb-3">
          Cancellation Policy <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <label
            className={`flex items-center gap-3 px-4 py-3 sm:py-2.5 rounded-xl border cursor-pointer transition-all flex-1 ${
              isStandard
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="cancellationPolicy"
              value="flexible"
              checked={isStandard}
              onChange={() => updateProduct({ cancellationPolicy: "flexible" })}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                isStandard ? "border-emerald-600" : "border-slate-300"
              }`}
            >
              {isStandard && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
            </div>
            <div>
              <span className="text-sm font-medium">Standard</span>
              <p className="text-xs text-slate-500 mt-0.5">Full refund if canceled at least 24 hours before</p>
            </div>
          </label>
          <label
            className={`flex items-center gap-3 px-4 py-3 sm:py-2.5 rounded-xl border cursor-pointer transition-all flex-1 ${
              !isStandard
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="cancellationPolicy"
              value="non-refundable"
              checked={!isStandard}
              onChange={() => updateProduct({ cancellationPolicy: "non-refundable" })}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                !isStandard ? "border-emerald-600" : "border-slate-300"
              }`}
            >
              {!isStandard && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
            </div>
            <div>
              <span className="text-sm font-medium">All Sales Final</span>
              <p className="text-xs text-slate-500 mt-0.5">No refunds available</p>
            </div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2">Additional Refund Rules</label>
        <p className="text-xs text-slate-500 mb-2">
          Any specific refund conditions or exceptions.
        </p>
        <textarea
          value={product.refundRules}
          onChange={(e) => updateProduct({ refundRules: e.target.value })}
          rows={3}
          placeholder="e.g., Full refund if canceled at least 24 hours before. 50% refund if canceled at least 12 hours before..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
}
