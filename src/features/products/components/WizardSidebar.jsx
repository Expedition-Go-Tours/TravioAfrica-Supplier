import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductBuilderStore, SECTIONS } from "@/features/products/stores/productBuilderStore";

const sectionVariants = {
  closed: { height: 0, opacity: 0 },
  open: { height: "auto", opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.15, ease: "easeIn" } },
};

export default function WizardSidebar() {
  const {
    currentSectionId,
    currentStepId,
    completedStepIds,
    navigateTo,
    submissionErrors,
  } = useProductBuilderStore();

  const [expandedSectionId, setExpandedSectionId] = useState(null);

  useEffect(() => {
    if (currentSectionId) {
      setExpandedSectionId(currentSectionId);
    }
  }, [currentSectionId]);

  const totalSteps = SECTIONS.reduce((sum, s) => sum + s.steps.length, 0);
  const overallProgress =
    totalSteps > 0
      ? Math.min(Math.round((completedStepIds.length / totalSteps) * 100), 100)
      : 0;

  const toggleSection = (id) => {
    setExpandedSectionId((prev) => (prev === id ? null : id));
  };

  return (
    <aside className="w-64 lg:w-72 shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
      {/* Fixed progress bar */}
      <div className="flex-shrink-0 border-b border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Progress
          </span>
          <span className="text-xs font-bold text-emerald-600">
            {overallProgress}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Scrollable sections */}
      <nav className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        {SECTIONS.map((section, sIdx) => {
          const isExpanded = expandedSectionId === section.id;
          const isLast = sIdx === SECTIONS.length - 1;
          const completedCount = section.steps.filter((s) => completedStepIds.includes(s.id)).length;

          return (
            <div key={section.id} className={cn(!isLast && "border-b border-slate-100")}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : -90 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="shrink-0"
                >
                  <ChevronDown size={14} className="text-slate-400" />
                </motion.div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex-1">
                  {section.label}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {completedCount}/{section.steps.length}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key={section.id}
                    variants={sectionVariants}
                    initial="closed"
                    animate="open"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <div className="pb-2 px-1">
                      {section.steps.map((step) => {
                        const isCompleted = completedStepIds.includes(step.id);
                        const isCurrent =
                          currentSectionId === section.id &&
                          currentStepId === step.id;

                        return (
                          <button
                            key={step.id}
                            onClick={() => navigateTo(section.id, step.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                              isCurrent
                                ? "bg-emerald-50 border border-emerald-200 shadow-sm"
                                : "hover:bg-slate-50 border border-transparent",
                            )}
                          >
                            <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                              {isCompleted ? (
                                <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                                  <Check size={12} className="text-white" />
                                </span>
                              ) : isCurrent ? (
                                <span className="w-5 h-5 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-slate-300" />
                              )}
                            </span>
                            <span
                              className={cn(
                                "text-xs leading-tight",
                                isCompleted && "text-emerald-700 font-medium",
                                isCurrent && "text-slate-900 font-semibold",
                                !isCompleted && !isCurrent && "text-slate-500",
                              )}
                            >
                              {step.label}
                            </span>
                            {submissionErrors[step.stepIndex] && (
                              <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-red-500">
                                <AlertCircle size={10} />
                                {Object.keys(submissionErrors[step.stepIndex]).length}
                              </span>
                            )}
                            {isCompleted && !isCurrent && !submissionErrors[step.stepIndex] && (
                              <Check size={12} className="text-emerald-500 ml-auto shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
