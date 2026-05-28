import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Star,
  MessageSquare,
  Search,
  Loader2,
  RefreshCw,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { REVIEW_STATUSES } from "@/lib/constants";
import {
  addReviewResponse,
  deleteReviewResponse,
  fetchSupplierReviews,
  updateReviewResponse,
} from "../api";
import { getAuthToken } from "@/stores/authStore";

const REVIEW_TABS = [
  { key: "all", label: "All Reviews", status: undefined },
  { key: "approved", label: "Approved", status: "APPROVED" },
  { key: "pending", label: "Pending", status: "PENDING" },
  { key: "replied", label: "Replied", clientFilter: "replied" },
  { key: "unreplied", label: "Unreplied", clientFilter: "unreplied" },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={14}
          className={index < rating ? "text-[#ffc400] fill-[#ffc400]" : "text-[#eaeaea]"}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentTab = REVIEW_TABS.find((tab) => tab.key === activeTab) || REVIEW_TABS[0];

  const loadReviews = useCallback(async () => {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = { limit: 50 };
      if (currentTab.status) params.status = currentTab.status;

      const result = await fetchSupplierReviews(params);
      setReviews(result.reviews);
    } catch (err) {
      if (err.code === "AUTH_REQUIRED") return;
      setError(err.response?.data?.message || err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [currentTab.status]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    let data = [...reviews];

    if (currentTab.clientFilter === "replied") {
      data = data.filter((review) => Boolean(review.supplierResponse));
    } else if (currentTab.clientFilter === "unreplied") {
      data = data.filter((review) => !review.supplierResponse);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (review) =>
          review.tourName.toLowerCase().includes(q) ||
          review.customerName.toLowerCase().includes(q) ||
          review.comment.toLowerCase().includes(q) ||
          review.title.toLowerCase().includes(q)
      );
    }

    return data;
  }, [reviews, currentTab.clientFilter, search]);

  const openReplyModal = (review) => {
    setReplyModal(review);
    setReplyText(review.supplierResponse || "");
  };

  const handleSubmitReply = async () => {
    if (!replyModal || replyText.trim().length < 10) {
      toast.error("Response must be at least 10 characters");
      return;
    }

    setSubmitting(true);
    try {
      if (replyModal.supplierResponse) {
        await updateReviewResponse(replyModal.id, replyText.trim());
        toast.success("Response updated");
      } else {
        await addReviewResponse(replyModal.id, replyText.trim());
        toast.success("Response posted");
      }
      setReplyModal(null);
      setReplyText("");
      await loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save response");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (reviewId) => {
    if (!confirm("Remove your response to this review?")) return;

    try {
      await deleteReviewResponse(reviewId);
      toast.success("Response removed");
      await loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove response");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1e293b]">Reviews</h1>
          <p className="text-sm text-[#64748b] mt-1">View customer reviews and respond to feedback</p>
        </div>
        <button
          onClick={loadReviews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#eaeaea] rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {REVIEW_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-[#044b3b] text-white"
                : "bg-white text-[#64748b] border border-[#eaeaea] hover:bg-[#f8fafc]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
        <input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-[#eaeaea] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#044b3b]/20"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-[#ffebeb] border border-[#fecaca] rounded-lg text-sm text-[#991b1b]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#044b3b]" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#eaeaea] rounded-lg">
          <Star size={32} className="mx-auto text-[#9e9e9e] mb-3" />
          <p className="text-sm text-[#64748b]">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white border border-[#eaeaea] rounded-lg p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} />
                    <StatusBadge
                      status={review.status.toUpperCase()}
                      label={REVIEW_STATUSES[review.status.toUpperCase()]?.label || review.status}
                      size="sm"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1e293b]">{review.title || "Review"}</h3>
                  <p className="text-xs text-[#64748b] mt-1">
                    {review.tourName} · {review.customerName} · {formatDate(review.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openReplyModal(review)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#044b3b] border border-[#044b3b]/20 rounded-lg hover:bg-[#f0fdf4] transition-colors"
                  >
                    <MessageSquare size={14} />
                    {review.supplierResponse ? "Edit Reply" : "Reply"}
                  </button>
                  {review.supplierResponse && (
                    <button
                      onClick={() => handleDeleteReply(review.id)}
                      className="p-2 text-[#64748b] hover:text-[#dc3545] hover:bg-[#ffebeb] rounded-lg transition-colors"
                      title="Remove response"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-[#64748b] leading-relaxed">{review.comment}</p>

              {review.supplierResponse && (
                <div className="mt-4 p-4 bg-[#f8fafc] border border-[#eaeaea] rounded-lg">
                  <p className="text-xs font-semibold text-[#044b3b] mb-1">Your Response</p>
                  <p className="text-sm text-[#1e293b]">{review.supplierResponse}</p>
                  {review.supplierResponseAt && (
                    <p className="text-xs text-[#9e9e9e] mt-2">
                      Posted {formatDate(review.supplierResponseAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-xl border border-[#eaeaea] shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#eaeaea]">
              <h2 className="text-lg font-semibold text-[#1e293b]">
                {replyModal.supplierResponse ? "Edit Response" : "Reply to Review"}
              </h2>
              <button
                onClick={() => setReplyModal(null)}
                className="p-1.5 text-[#64748b] hover:bg-[#f8fafc] rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-[#64748b]">
                Responding to {replyModal.customerName} on {replyModal.tourName}
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                placeholder="Write your response (10–1000 characters)..."
                className="w-full px-4 py-3 border border-[#eaeaea] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#044b3b]/20 resize-none"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setReplyModal(null)}
                  className="px-4 py-2.5 text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#044b3b] text-white rounded-lg text-sm font-medium hover:bg-[#033629] disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {replyModal.supplierResponse ? "Update Response" : "Post Response"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
