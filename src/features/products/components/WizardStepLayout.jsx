import { motion } from "framer-motion";
import WizardSidebar from "./WizardSidebar";
import WizardNavFooter from "./WizardNavFooter";

export default function WizardStepLayout({ children, title, description }) {
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
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
