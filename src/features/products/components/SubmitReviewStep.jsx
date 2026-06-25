import { useState, useEffect } from "react";
import { Check, AlertTriangle, ArrowRight, ArrowUpFromLine, Loader2 } from "lucide-react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

function ErrorList({ errors, stepIndex, goToStep }) {
  return (
    <ul className="mt-2 space-y-1">
      {Object.values(errors).map((err, i) => (
        <li key={i}>
          <button
            type="button"
            onClick={() => goToStep(stepIndex)}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 hover:underline transition-colors"
          >
            <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
            {err}
            <ArrowRight size={11} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function SubmitReviewStep() {
  const { product, steps, goToStep } = useProductBuilderStore();
  const [submitting, setSubmitting] = useState(false);
  const [validationResults, setValidationResults] = useState([]);

  useEffect(() => {
    const results = steps.map((_, index) => {
      const isValid = useProductBuilderStore.getState().validateStep(index);
      const errors = isValid ? {} : useProductBuilderStore.getState().errors;
      return { step: index, isValid, errors };
    });
    setValidationResults(results);
  }, [steps, product]);

  const allValid = validationResults.length > 0 && validationResults.every((r) => r.isValid);
  const errorCount = validationResults.filter((r) => !r.isValid).length;

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-xl border-2 shadow-sm overflow-hidden ${
        allValid ? "border-emerald-500" : "border-amber-400"
      }`}>
        <div className={`px-5 py-4 flex items-start gap-4 ${
          allValid ? "bg-emerald-50" : "bg-amber-50"
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            allValid ? "bg-emerald-500" : "bg-amber-400"
          }`}>
            {allValid ? (
              <Check size={20} className="text-white" />
            ) : (
              <AlertTriangle size={20} className="text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-base font-semibold ${
              allValid ? "text-emerald-800" : "text-amber-800"
            }`}>
              {allValid ? "Ready to submit!" : `${errorCount} step${errorCount > 1 ? "s" : ""} need${errorCount === 1 ? "s" : ""} attention`}
            </p>
            <p className={`text-sm mt-0.5 ${
              allValid ? "text-emerald-600" : "text-amber-600"
            }`}>
              {allValid
                ? "All required fields are filled. Review your product and submit for approval."
                : "Review the issues below and click on any error to jump to that step and fix it."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {steps.slice(0, -1).map((step, index) => {
          const result = validationResults[index];
          if (!result) return null;
          return (
            <div
              key={step.id}
              className={`group relative bg-white rounded-xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
                result.isValid ? "border-slate-200" : "border-red-200"
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                result.isValid ? "bg-emerald-500" : "bg-red-400"
              }`} />

              <div className="pl-5 pr-5 py-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    result.isValid ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                  }`}>
                    {result.isValid ? (
                      <Check size={18} />
                    ) : (
                      <AlertTriangle size={18} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {step.number}. {step.label}
                      </p>
                      {!result.isValid && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-600 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {Object.keys(result.errors).length} issue{Object.keys(result.errors).length > 1 ? "s" : ""}
                        </span>
                      )}
                      {result.isValid && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-600 shrink-0">
                          <Check size={11} />
                          Complete
                        </span>
                      )}
                    </div>
                    {!result.isValid && Object.keys(result.errors).length > 0 && (
                      <div className="group/errors">
                        <ErrorList errors={result.errors} stepIndex={index} goToStep={goToStep} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allValid || submitting}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
          allValid && !submitting
            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <ArrowUpFromLine size={18} />
            Submit for Review
          </>
        )}
      </button>
    </div>
  );
}
