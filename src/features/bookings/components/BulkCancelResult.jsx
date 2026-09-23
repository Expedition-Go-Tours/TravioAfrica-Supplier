import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

/**
 * Result body for the bulk-cancel wizard (step 4).
 *
 * Two modes, chosen from the API payload:
 *  - admin-approval gate ON  → `requested`/`requests` present: N requests were
 *    SUBMITTED FOR REVIEW (nothing executed, no refunds/fees/customer emails).
 *  - gate OFF (executed now) → `cancelled` summary, unchanged.
 */
export default function BulkCancelResult({ result, taxonomy }) {
  if (!result) return null;

  if (result.requested !== undefined) {
    return (
      <>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "Submitted for review", value: result.requested ?? 0 },
            { label: "Skipped", value: result.skipped ?? 0 },
            { label: "Failed", value: result.failed ?? 0 },
            { label: "Matched", value: result.matched ?? 0 },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <p className="flex items-start gap-2">
            <Clock size={15} className="text-amber-600 shrink-0 mt-0.5" />
            {result.requested ?? 0} cancellation request
            {result.requested === 1 ? "" : "s"} submitted for admin review.{" "}
            <strong>Nothing has been executed yet</strong> — the bookings,
            refunds and customer notifications stay unchanged until an admin
            approves each request.
          </p>

          {result.stopSellingApplied && result.blockedDates?.length > 0 && (
            <p className="flex items-start gap-2">
              <Ban size={15} className="text-amber-600 shrink-0 mt-0.5" />
              Stopped accepting bookings for {result.blockedDates.length} date
              {result.blockedDates.length === 1 ? "" : "s"}:{" "}
              {result.blockedDates.slice(0, 6).join(", ")}
              {result.blockedDates.length > 6
                ? ` +${result.blockedDates.length - 6} more`
                : ""}
              . Withdrawing a request re-opens these dates.
            </p>
          )}

          {result.skipped > 0 && (
            <p className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200/70 p-3 text-amber-800">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              {result.skipped} booking(s) already had a pending request and were
              skipped.
            </p>
          )}

          {result.overflow && (
            <p className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200/70 p-3 text-amber-800">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              Your selection matched more bookings than one run can process (100
              max). This run included the first 100 — run the wizard again to
              submit the rest.
            </p>
          )}

          {result.failed > 0 && Array.isArray(result.results) && (
            <ul className="rounded-lg bg-red-50 border border-red-200/70 p-3 text-xs text-red-700 space-y-1">
              <li className="font-semibold">
                {result.failed} booking(s) could not be submitted:
              </li>
              {result.results
                .filter((r) => !r.ok)
                .slice(0, 5)
                .map((r) => (
                  <li key={r.bookingId}>
                    {r.bookingNumber}: {r.error}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Cancelled", value: result.cancelled ?? 0 },
          { label: "Failed", value: result.failed ?? 0 },
          {
            label: "Total refunded",
            value: formatCurrency(Number(result.totalRefunded) || 0),
          },
          {
            label: "Cancellation fees",
            value: formatCurrency(Number(result.totalFees) || 0),
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <p className="text-lg font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p className="flex items-start gap-2">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
          {result.matched ?? 0} booking(s) matched this run. Each customer gets a
          full refund and {(taxonomy?.feePct ?? 25) + "%"} cancellation fees (
          {formatCurrency(Number(result.totalFees) || 0)}) are deducted
          automatically from your next payout request.
        </p>

        {result.blockedDates?.length > 0 && (
          <p className="flex items-start gap-2">
            <Ban size={15} className="text-amber-600 shrink-0 mt-0.5" />
            Stopped accepting bookings for {result.blockedDates.length} date
            {result.blockedDates.length === 1 ? "" : "s"}:{" "}
            {result.blockedDates.slice(0, 6).join(", ")}
            {result.blockedDates.length > 6
              ? ` +${result.blockedDates.length - 6} more`
              : ""}
          </p>
        )}

        {result.overflow && (
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200/70 p-3 text-amber-800">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            Your selection matched more bookings than one run can cancel (100
            max). This run included the first 100 — run the wizard again to
            cancel the rest.
          </p>
        )}

        {result.failed > 0 && Array.isArray(result.results) && (
          <ul className="rounded-lg bg-red-50 border border-red-200/70 p-3 text-xs text-red-700 space-y-1">
            <li className="font-semibold">
              {result.failed} booking(s) could not be cancelled:
            </li>
            {result.results
              .filter((r) => !r.ok)
              .slice(0, 5)
              .map((r) => (
                <li key={r.bookingId}>
                  {r.bookingNumber}: {r.error}
                </li>
              ))}
          </ul>
        )}
      </div>
    </>
  );
}
