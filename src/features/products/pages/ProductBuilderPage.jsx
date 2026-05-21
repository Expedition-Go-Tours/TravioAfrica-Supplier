import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";
import WizardStepLayout from "@/features/products/components/WizardStepLayout";
import ProductTypeStep from "@/features/products/components/ProductTypeStep";
import ProductBasicsStep from "@/features/products/components/ProductBasicsStep";
import ProductPhotosStep from "@/features/products/components/ProductPhotosStep";
import ProductPricingStep from "@/features/products/components/ProductPricingStep";
import ProductScheduleStep from "@/features/products/components/ProductScheduleStep";
import ProductBookingStep from "@/features/products/components/ProductBookingStep";
import ProductContentStep from "@/features/products/components/ProductContentStep";
import ProductReviewStep from "@/features/products/components/ProductReviewStep";

const STEPS = [
  { id: "type", label: "Product Type", description: "Choose the type of product you are creating.", component: ProductTypeStep },
  { id: "basics", label: "Product Basics", description: "Enter the basic information about your product.", component: ProductBasicsStep },
  { id: "content", label: "Product Content", description: "Add itinerary, highlights, languages, and other content.", component: ProductContentStep },
  { id: "photos", label: "Photos & Media", description: "Upload photos and add media to showcase your product.", component: ProductPhotosStep },
  { id: "pricing", label: "Pricing & Tickets", description: "Set pricing tiers, taxes, and cancellation policies.", component: ProductPricingStep },
  { id: "schedule", label: "Schedule & Availability", description: "Define when your product operates and capacity limits.", component: ProductScheduleStep },
  { id: "booking", label: "Booking Rules", description: "Configure how customers can book your product.", component: ProductBookingStep },
  { id: "review", label: "Review & Submit", description: "Review all details before submitting your product.", component: ProductReviewStep },
];

export default function ProductBuilderPage() {
  const { id, step } = useParams();
  const navigate = useNavigate();
  const { currentStep, setStep, reset, loadDraft, hasHydrated } = useProductBuilderStore();

  const [showRestoreBanner, setShowRestoreBanner] = useState(false);

  // Map URL step param to step index
  const foundIndex = STEPS.findIndex((s) => s.id === step);
  const stepIndex = foundIndex !== -1 ? foundIndex : 0;

  // Check for saved draft on initial hydration
  useEffect(() => {
    if (!hasHydrated) return;

    // Only show banner when creating NEW product (not editing)
    if (id && id !== "new") return;

    // Check if there's meaningful saved data (more than just defaults)
    const saved = localStorage.getItem("product-builder-draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedProduct = parsed.state?.product;
        if (savedProduct && savedProduct.title && savedProduct.title.trim().length > 0) {
          setShowRestoreBanner(true);
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [hasHydrated, id]);

  // Sync URL with store
  useEffect(() => {
    if (step && stepIndex !== currentStep) {
      setStep(stepIndex);
    }
  }, [step, stepIndex]);

  // Update URL when step changes
  useEffect(() => {
    const currentStepId = STEPS[currentStep]?.id;
    if (currentStepId && currentStepId !== step) {
      navigate(`/products/build/${id || "new"}/${currentStepId}`, { replace: true });
    }
  }, [currentStep]);

  // Load draft if editing
  useEffect(() => {
    if (id && id !== "new") {
      // In real app, fetch draft from API
      // loadDraft(fetchedDraft);
    }
  }, [id]);

  const handleRestoreDraft = () => {
    const saved = localStorage.getItem("product-builder-draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedState = parsed.state;
        if (savedState) {
          loadDraft(savedState.product);
          const savedStep = savedState.currentStep ?? 0;
          setStep(savedStep);
          const stepId = STEPS[savedStep]?.id;
          if (stepId) {
            navigate(`/products/build/new/${stepId}`, { replace: true });
          }
        }
      } catch {
        // Invalid, clear it
        localStorage.removeItem("product-builder-draft");
      }
    }
    setShowRestoreBanner(false);
  };

  const handleDismissBanner = () => {
    localStorage.removeItem("product-builder-draft");
    reset();
    setShowRestoreBanner(false);
  };

  const CurrentStepComponent = STEPS[currentStep]?.component;

  return (
    <div className="p-4 md:p-6">
      {/* Draft Restore Banner */}
      {showRestoreBanner && (
        <div className="mb-4 p-4 bg-[#fffbeb] border border-[#ffc400] rounded-lg flex items-start gap-3">
          <RotateCcw size={18} className="text-[#b45309] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1e293b]">
              You have an unsaved draft
            </p>
            <p className="text-xs text-[#64748b] mt-0.5">
              Would you like to continue where you left off? All your inputs are preserved.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleRestoreDraft}
                className="px-3 py-1.5 bg-[#044b3b] text-white rounded-md text-xs font-medium hover:bg-[#033629] transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={handleDismissBanner}
                className="px-3 py-1.5 border border-[#eaeaea] rounded-md text-xs font-medium text-[#64748b] hover:bg-[#f8fafc] transition-colors"
              >
                Start New
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowRestoreBanner(false)}
            className="text-[#9e9e9e] hover:text-[#64748b]"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#1e293b]">
          {id && id !== "new" ? "Edit Product" : "Create New Product"}
        </h1>
        <p className="text-sm text-[#64748b] mt-1">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]?.label}
        </p>
      </div>

      {/* Wizard */}
      <WizardStepLayout title={STEPS[currentStep]?.label} description={STEPS[currentStep]?.description}>
        {CurrentStepComponent && <CurrentStepComponent />}
      </WizardStepLayout>
    </div>
  );
}
