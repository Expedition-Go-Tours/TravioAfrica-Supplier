import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import WizardSidebar from "./WizardSidebar";
import WizardNavFooter from "./WizardNavFooter";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

export default function WizardStepLayout({ children, title, description }) {
  const { currentStep, submissionErrors } = useProductBuilderStore();

  const currentStepErrors = submissionErrors[currentStep];
  const otherErrorCount = Object.keys(submissionErrors).filter(
    (k) => Number(k) !== currentStep,
  ).length;

  return (
    <div className="flex gap-4 md:gap-6 h-full min-h-0">
      {/* Sidebar */}
      <div className="hidden lg:block h-full rounded-xl overflow-hidden">
        <WizardSidebar />
      </div>

      {/* Main Content */}
      <motion.div
        key={title}
        className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className={`bg-white rounded-xl border shadow-sm ${
          currentStepErrors ? "border-red-300" : "border-slate-200"
        }`}>
          {/* Error banner */}
          {otherErrorCount > 0 && (
            <div className="flex items-center gap-2 px-4 md:px-6 py-2 bg-amber-50 border-b border-amber-200">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">
                {otherErrorCount} other step{otherErrorCount > 1 ? "s" : ""} with errors. Fix all errors before submitting.
              </p>
            </div>
          )}

          {/* Current step errors banner */}
          {currentStepErrors && (
            <div className="flex items-center gap-2 px-4 md:px-6 py-2 bg-red-50 border-b border-red-200">
              <AlertCircle size={14} className="text-red-600 shrink-0" />
              <p className="text-xs text-red-700">
                {Object.keys(currentStepErrors).length} issue{Object.keys(currentStepErrors).length > 1 ? "s" : ""} on this step. Fix highlighted fields below.
              </p>
            </div>
          )}

          {/* Step Header */}
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-200">
            <h2 className="text-base md:text-lg font-semibold text-slate-800">{title}</h2>
            {description && (
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            )}
          </div>

          {/* Step Body */}
          <div className="p-4 md:p-6">{children}</div>

          {/* Step Footer */}
          <div className="px-4 md:px-6 py-3 md:py-4 border-t border-slate-200">
            <WizardNavFooter />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
