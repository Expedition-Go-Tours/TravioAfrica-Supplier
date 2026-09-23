import { useCallback, useEffect, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  RotateCw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { categoryMeta } from "@/features/bookings/lib/cancellationReasons";
import {
  fetchSupplierCancellationRequests,
  withdrawCancellationRequest,
} from "@/features/bookings/api";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

/**
 * Supplier cancellation requests (admin-approval gate).
 *
 * GET /bookings/supplier/cancellation-requests lists the supplier's own
 * requests. While the gate is ON a cancellation touches nothing until an admin
 * approves — this section is where the supplier watches the queue and can
 * Withdraw a still-pending request (which re-opens any dates it blocked).
 */

const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING_APPROVAL", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "WITHDRAWN", label: "Withdrawn" },
  { key: "SUPERSEDED", label: "Superseded" },
];

const STATUS_META = {
  PENDING_APPROVAL: {
    label: "Pending approval",
    styles: "bg-amber-50 text-amber-700 border-amber-200/70",
    icon: Clock,
  },
  APPROVING: {
    label: "Being reviewed",
    styles: "bg-blue-50 text-blue-700 border-blue-200/70",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    styles: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    styles: "bg-red-50 text-red-700 border-red-200/70",
    icon: XCircle,
  },
  WITHDRAWN: {
    label: "Withdrawn",
    styles: "bg-slate-100 text-slate-600 border-slate-200",
    icon: XCircle,
  },
  SUPERSEDED: {
    label: "Superseded",
    styles: "bg-slate-100 text-slate-600 border-slate-200",
    icon: XCircle,
  },
};

function statusMeta(status) {
  return (
    STATUS_META[status] || {
      label: status ? String(status).replace(/_/g, " ").toLowerCase() : "Unknown",
      styles: "bg-slate-100 text-slate-600 border-slate-200",
      icon: Clock,
    }
  );
}

function humanizeCode(code) {
  if (!code) return "";
  return String(code)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function reasonLabel(payload = {}) {
  const code = humanizeCode(payload.cancellationCode);
  if (code) return code;
  const category = categoryMeta(payload.cancellationCategory);
  return category?.title || humanizeCode(payload.cancellationCategory) || "—";
}

export default function CancellationRequestsSection() {
  const [status, setStatus] = useState("ALL");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Deferred one microtask so no state is set synchronously inside the
    // effect body (react-hooks/set-state-in-effect).
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      fetchSupplierCancellationRequests({ status, page: 1, limit: 50 })
        .then((data) => {
          if (!cancelled) setRequests(data.requests || []);
        })
        .catch(() => {
          if (!cancelled) setError("Failed to load cancellation requests.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [status, reloadKey]);

  const confirmWithdraw = useCallback(async () => {
    const requestId = withdrawTarget?.id;
    if (!requestId) return;
    setWithdrawing(true);
    try {
      await withdrawCancellationRequest(requestId);
      toast.success("Cancellation request withdrawn");
      setWithdrawTarget(null);
      setReloadKey((n) => n + 1);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("This request was already decided and can no longer be withdrawn");
        setWithdrawTarget(null);
        setReloadKey((n) => n + 1);
      } else if (err.code !== "AUTH_REQUIRED") {
        toast.error(err.response?.data?.message || "Failed to withdraw the request");
      }
    } finally {
      setWithdrawing(false);
    }
  }, [withdrawTarget]);

  const canWithdraw = (request) =>
    request.status === "PENDING_APPROVAL" || request.status === "APPROVING";

  return (
    <section className="bg-white border border-slate-200 rounded-[20px] p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Cancellation requests
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supplier cancellations need admin approval — nothing changes until a
            request is approved.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((n) => n + 1)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <RotateCw size={13} />
          )}
          Refresh
        </button>
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatus(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              status === tab.key
                ? "bg-[#044b3b] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-50 border border-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-red-50 border border-red-200/70">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((n) => n + 1)}
            className="shrink-0 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
            <Clock size={20} className="text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            No cancellation requests
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Cancellations you submit appear here while they await approval.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const booking = request.booking || {};
            const tour = request.tour || {};
            const payload = request.payload || {};
            const preview = request.preview || {};
            const currency = booking.currency || "USD";
            const meta = statusMeta(request.status);
            const StatusIcon = meta.icon;
            const blockedCount = preview.stopSell?.blocked?.length || 0;
            const refundAmount = Number(preview.refund?.amount) || 0;
            const fee = Number(preview.fee) || 0;

            return (
              <article
                key={request.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {booking.bookingNumber || request.bookingId}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${meta.styles}`}
                      >
                        <StatusIcon size={11} />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 mt-1">
                      {tour.title || booking.tourTitle || "Tour"}
                    </p>
                  </div>
                  {canWithdraw(request) && (
                    <button
                      type="button"
                      onClick={() => setWithdrawTarget(request)}
                      className="shrink-0 px-3 py-1.5 rounded-lg border border-amber-200/70 bg-white text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      Withdraw
                    </button>
                  )}
                </div>

                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mt-3 text-xs">
                  <div>
                    <dt className="text-slate-400">Travel date</dt>
                    <dd className="text-slate-700 font-medium mt-0.5">
                      {booking.travelDate ? formatDate(booking.travelDate) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Requested</dt>
                    <dd className="text-slate-700 font-medium mt-0.5">
                      {request.createdAt ? formatDateTime(request.createdAt) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Refund (if approved)</dt>
                    <dd className="text-slate-700 font-medium mt-0.5">
                      {formatCurrency(refundAmount, currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Fee (if approved)</dt>
                    <dd className="text-slate-700 font-medium mt-0.5">
                      {fee > 0 ? formatCurrency(fee, currency) : "No fee"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600 space-y-1.5">
                  <p>
                    <span className="font-medium text-slate-700">Reason: </span>
                    {reasonLabel(payload)}
                    {payload.explanation && (
                      <span className="block mt-0.5 text-slate-500 leading-relaxed">
                        {payload.explanation}
                      </span>
                    )}
                  </p>
                  {payload.evidenceUrl && (
                    <a
                      href={payload.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#044b3b] underline hover:text-[#033629]"
                    >
                      View evidence <ExternalLink size={11} />
                    </a>
                  )}
                  {typeof payload.customerRefundAgreed === "boolean" && (
                    <p className="text-slate-500">
                      Customer refund agreed:{" "}
                      <span className="font-medium text-slate-700">
                        {payload.customerRefundAgreed ? "Yes" : "No"}
                      </span>
                    </p>
                  )}
                  <p className="text-slate-500">
                    {preview.countsTowardRate
                      ? "Counts toward your cancellation rate"
                      : "Not counted toward your cancellation rate"}
                  </p>
                </div>

                {(request.stopSellingApplied || blockedCount > 0) && (
                  <p className="flex items-start gap-1.5 mt-2 text-xs text-amber-700">
                    <Ban size={12} className="shrink-0 mt-0.5" />
                    Stop-selling active
                    {blockedCount > 0
                      ? ` for ${blockedCount} date${blockedCount === 1 ? "" : "s"} — Withdraw re-opens them.`
                      : " — Withdraw re-opens the dates."}
                  </p>
                )}

                {request.decidedAt && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                    <p>
                      <span className="font-medium text-slate-700">
                        {request.status === "APPROVED" ? "Approved" : "Decided"}
                      </span>{" "}
                      {formatDateTime(request.decidedAt)}
                      {request.decidedBy?.name
                        ? ` by ${request.decidedBy.name}`
                        : ""}
                    </p>
                    {request.decisionNote && (
                      <p className="leading-relaxed">
                        <span className="font-medium text-slate-700">Note: </span>
                        {request.decisionNote}
                      </p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!withdrawTarget}
        title="Withdraw cancellation request?"
        description={`#${withdrawTarget?.booking?.bookingNumber || ""} will stay exactly as it is — no refund, no fee and no customer notification. Any dates we blocked for this request will be re-opened for new bookings.`}
        confirmLabel="Withdraw request"
        cancelLabel="Keep request"
        isLoading={withdrawing}
        onConfirm={confirmWithdraw}
        onClose={() => {
          if (!withdrawing) setWithdrawTarget(null);
        }}
      />
    </section>
  );
}
