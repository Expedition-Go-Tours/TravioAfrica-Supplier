import { Globe, ExternalLink, Check, X } from "lucide-react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

export default function ConnectTripadvisorStep() {
  const { product, updateNested } = useProductBuilderStore();

  const connected = product.tripadvisorConnected;
  const listingId = product.tripadvisorListingId;

  const handleConnect = () => {
    if (!listingId.trim()) return;
    updateNested("tripadvisorConnected", true);
  };

  const handleDisconnect = () => {
    updateNested("tripadvisorConnected", false);
    updateNested("tripadvisorListingId", "");
  };

  return (
    <div className="space-y-6">
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            connected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
          }`}>
            <Globe size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-800">Connect Tripadvisor Listing</h3>
            <p className="text-sm text-slate-500 mt-1">
              Link your existing Tripadvisor listing to sync reviews, enhance visibility, and manage everything from one place.
            </p>
          </div>
        </div>
      </div>

      {!connected ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-2">
              Tripadvisor Listing URL or ID
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Enter the full URL or the ID of your Tripadvisor listing. You can find this in your Tripadvisor management account.
            </p>
            <input
              type="text"
              value={listingId}
              onChange={(e) => updateNested("tripadvisorListingId", e.target.value)}
              placeholder="https://www.tripadvisor.com/..." 
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button
            onClick={handleConnect}
            disabled={!listingId.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ExternalLink size={16} />
            Connect Listing
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800">Connected to Tripadvisor</p>
              <p className="text-xs text-emerald-600 mt-0.5 break-all">{listingId}</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <X size={16} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
