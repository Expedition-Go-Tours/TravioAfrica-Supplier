import { Percent, DollarSign, CalendarDays, Sparkles } from "lucide-react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";
import DatePicker from "@/components/forms/DatePicker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AddIntroOfferStep() {
  const { product, updateNested } = useProductBuilderStore();
  const offer = product.introOffer;

  const toggleOffer = () => {
    updateNested("introOffer.enabled", !offer.enabled);
  };

  return (
    <div className="space-y-6">
      <div
        onClick={toggleOffer}
        className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
          offer.enabled
            ? "border-emerald-600 bg-emerald-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            offer.enabled ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
          }`}>
            <Sparkles size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <p className={`text-base font-semibold ${offer.enabled ? "text-emerald-800" : "text-slate-800"}`}>
                Introductory Offer
              </p>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                offer.enabled ? "border-emerald-600" : "border-slate-300"
              }`}>
                {offer.enabled && <div className="w-3 h-3 rounded-full bg-emerald-600" />}
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Offer a limited-time discount to attract early bookings and kickstart your product.
            </p>
          </div>
        </div>
      </div>

      {offer.enabled && (
        <div className="space-y-6 pl-4 border-l-2 border-emerald-200 ml-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-2">Discount Type</label>
              <Select
                value={offer.discountType}
                onValueChange={(value) => updateNested("introOffer.discountType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-2">
                <span className="flex items-center gap-2">
                  {offer.discountType === "percentage" ? <Percent size={16} className="text-slate-500" /> : <DollarSign size={16} className="text-slate-500" />}
                  Discount {offer.discountType === "percentage" ? "Percentage" : "Amount"}
                </span>
              </label>
              <div className="relative">
                {offer.discountType === "fixed" && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                )}
                <input
                  type="number"
                  value={offer.discountPercentage}
                  onChange={(e) => updateNested("introOffer.discountPercentage", e.target.value)}
                  placeholder={offer.discountType === "percentage" ? "e.g. 20" : "e.g. 50"}
                  min="0"
                  max={offer.discountType === "percentage" ? "100" : undefined}
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                    offer.discountType === "fixed" ? "pl-8" : ""
                  }`}
                />
                {offer.discountType === "percentage" && (
                  <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-slate-500" />
                Offer Validity Period
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">Offer Start Date</label>
                <DatePicker
                  value={offer.startDate}
                  onChange={(value) => updateNested("introOffer.startDate", value)}
                  placeholder="Select start date"
                  className="w-full"
                  maxDate={offer.endDate || undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">Offer End Date</label>
                <DatePicker
                  value={offer.endDate}
                  onChange={(value) => updateNested("introOffer.endDate", value)}
                  placeholder="Select end date"
                  className="w-full"
                  minDate={offer.startDate || undefined}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-slate-500" />
                Bookable Travel Dates
              </span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              The travel dates that are eligible for this introductory offer.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">Bookable From</label>
                <DatePicker
                  value={offer.bookableStartDate}
                  onChange={(value) => updateNested("introOffer.bookableStartDate", value)}
                  placeholder="Select start date"
                  className="w-full"
                  maxDate={offer.bookableEndDate || undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">Bookable Until</label>
                <DatePicker
                  value={offer.bookableEndDate}
                  onChange={(value) => updateNested("introOffer.bookableEndDate", value)}
                  placeholder="Select end date"
                  className="w-full"
                  minDate={offer.bookableStartDate || undefined}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
