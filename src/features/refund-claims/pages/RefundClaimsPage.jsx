import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Loader2, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Clock, Undo2, Ticket, MessageSquareText, DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { fetchSupplierClaims, approveClaim, declineClaim, formatCurrency } from "../api";

const REASON_LABELS = {
  NOT_AS_DESCRIBED: "Didn't match the description",
  SERVICE_NOT_PROVIDED: "Service wasn't provided",
  GUIDE_ISSUE: "Guide or host issue",
  TRANSPORT_ISSUE: "Transport problem",
  SCHEDULE_CHANGE: "Last-minute schedule change",
  HEALTH_SAFETY: "Health or safety concern",
  OTHER: "Other",
};

const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "SUBMITTED", label: "Awaiting your review" },
  { key: "SUPPLIER_APPROVED", label: "Approved" },
  { key: "SUPPLIER_DECLINED", label: "Declined" },
  { key: "RELEASED", label: "Refunded" },
];

function statusPill(status) {
  switch (status) {
    case "SUBMITTED":
      return { label: "Awaiting your review", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock };
    case "SUPPLIER_APPROVED":
      return { label: "Approved · awaiting release", cls: "bg-sky-50 text-sky-700 border-sky-200", icon: CheckCircle2 };
    case "SUPPLIER_DECLINED":
    case "ADMIN_DECLINED":
      return { label: "Declined", cls: "bg-red-50 text-red-700 border-red-200", icon: XCircle };
    case "RELEASED":
      return { label: "Refunded", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Undo2 };
    default:
      return { label: status, cls: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock };
  }
}

function money(amount, currency) {
  return formatCurrency(amount, currency);
}

export default function RefundClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [busyId, setBusyId] = useState(null);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineNote, setDeclineNote] = useState("");
  const [declining, setDeclining] = useState(false);
  const [searchParams] = useSearchParams();
  const focusClaimId = searchParams.get("claimId");

  const load = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchSupplierClaims(status);
      setClaims(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load refund requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) load(filter);
    });
    return () => { cancelled = true; };
  }, [load, filter]);

  // Auto-open the claim referenced from an email deep link (?claimId=...).
  useEffect(() => {
    if (!focusClaimId || loading || claims.length === 0) return;
    const target = document.getElementById(`claim-${focusClaimId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("ring-2", "ring-emerald-300");
      setTimeout(() => target.classList.remove("ring-2", "ring-emerald-300"), 6000);
    }
  }, [focusClaimId, claims, loading]);

  const handleApprove = async (claim) => {
    if (!window.confirm(`Approve ${claim.booking.customerName}'s ${claim.type.toLowerCase()} refund request (${claim.claimNumber})? This forwards it to our team to release the money.`)) return;
    setBusyId(claim.id);
    try {
      const updated = await approveClaim(claim.id);
      setClaims((prev) => prev.map((c) => (c.id === claim.id ? { ...c, ...updated, status: "SUPPLIER_APPROVED" } : c)));
      toast.success("Approved — forwarded to our team to release the refund");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not approve the request");
    } finally {
      setBusyId(null);
    }
  };

  const openDecline = (claim) => {
    setDeclineTarget(claim);
    setDeclineNote("");
  };

  const handleDecline = async () => {
    if (!declineTarget || !declineNote.trim()) return;
    setDeclining(true);
    try {
      const updated = await declineClaim(declineTarget.id, declineNote.trim());
      setClaims((prev) => prev.map((c) => (c.id === declineTarget.id ? { ...c, ...updated, status: "SUPPLIER_DECLINED" } : c)));
      setDeclineTarget(null);
      toast.success("Request declined");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not decline the request");
    } finally {
      setDeclining(false);
    }
  };

  const counts = useMemo(() => {
    const c = { SUBMITTED: 0, SUPPLIER_APPROVED: 0, SUPPLIER_DECLINED: 0, RELEASED: 0 };
    for (const cl of claims) if (c[cl.status] != null) c[cl.status] += 1;
    return c;
  }, [claims]);

  return (
    <div className="p-5 md:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Refund requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Customers request refunds on completed trips. Approve them so our team can release the money, or decline with a note.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(filter)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-emerald-200/60 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setFilter(s.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === s.key
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s.label}
            {counts[s.key] != null && s.key !== "ALL" && <span className="ml-1.5 opacity-70">({counts[s.key]})</span>}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
              <div className="h-4 w-40 bg-slate-100 rounded mb-3" />
              <div className="h-3 w-full bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <Undo2 size={20} className="text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No refund requests</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Requests customers file after completed trips will appear here for you to review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => {
            const pill = statusPill(claim.status);
            const Icon = pill.icon;
            const showActions = claim.status === "SUBMITTED";
            return (
              <div key={claim.id} id={`claim-${claim.id}`} className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-shadow hover:shadow-sm">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{claim.booking.tourTitle || "Tour"}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${pill.cls}`}>
                          <Icon size={12} /> {pill.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Ref {claim.booking.bookingNumber} · {claim.booking.customerName}
                        {claim.booking.customerEmail ? ` · ${claim.booking.customerEmail}` : ""}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {claim.type === "FULL"
                          ? `Full refund · ${money(claim.booking.total, claim.booking.currency)}`
                          : `Partial · requested ${money(claim.requestedAmount, claim.booking.currency)}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">of {money(claim.booking.total, claim.booking.currency)} paid</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm">
                    <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <MessageSquareText size={14} className="text-slate-400" />
                      {REASON_LABELS[claim.reason] || claim.reason}
                    </p>
                    {claim.details && <p className="text-slate-600 mt-1 text-[13px] leading-relaxed">{claim.details}</p>}
                    {claim.reviewNote && (
                      <p className="text-xs text-red-600 mt-2 italic">
                        Decision note: {claim.reviewNote}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Ticket size={13} />
                      {claim.claimNumber} · filed {new Date(claim.createdAt).toLocaleDateString()}
                      {claim.releasedAmount > 0 && claim.status === "RELEASED" && (
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <DollarSign size={12} /> {money(claim.releasedAmount, claim.booking.currency)} released
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {showActions && (
                        <>
                          <button
                            type="button"
                            onClick={() => openDecline(claim)}
                            disabled={busyId === claim.id}
                            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(claim)}
                            disabled={busyId === claim.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            {busyId === claim.id && <Loader2 size={12} className="animate-spin" />}
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {declineTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => !declining && setDeclineTarget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold text-slate-900 mb-1">Decline refund request</h2>
            <p className="text-sm text-slate-500">
              {declineTarget.booking.customerName} requested a {declineTarget.type.toLowerCase()} refund for{" "}
              <strong>{declineTarget.booking.tourTitle || "the tour"}</strong>.
            </p>
            <label className="block mt-4">
              <span className="text-sm font-semibold text-slate-700">Reason for declining</span>
              <textarea
                rows={3}
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
                placeholder="Explain the decision — the customer will see this note"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeclineTarget(null)}
                disabled={declining}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={declining || !declineNote.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {declining && <Loader2 size={13} className="animate-spin" />}
                Decline request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
