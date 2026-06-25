import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

export default function TicketRedemptionStep() {
  const { product, updateNested } = useProductBuilderStore();
  const { bookingRules } = product;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Provide instructions on how travelers redeem their tickets or vouchers.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2">
          Redemption Instructions
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Explain how and where travelers redeem their tickets. Include details about meeting points, box offices, or digital check-in.
        </p>
        <textarea
          value={bookingRules.redemptionInstructions}
          onChange={(e) => updateNested("bookingRules.redemptionInstructions", e.target.value)}
          rows={5}
          placeholder="Present your mobile or printed voucher at the meeting point. Our guide will check you in..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2">
          Redemption Venue / Address
        </label>
        <p className="text-xs text-slate-500 mb-2">
          The physical location where tickets are redeemed, if different from the meeting point.
        </p>
        <input
          type="text"
          value={bookingRules.redemptionVenueAddress}
          onChange={(e) => updateNested("bookingRules.redemptionVenueAddress", e.target.value)}
          placeholder="123 Main Street, City, Country"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
