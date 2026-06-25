import { FileEdit, Globe, MapPin, Clock, Users, DollarSign, Star, CheckCircle, AlertCircle, Calendar, Tag, Shield, ChevronRight } from "lucide-react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

export default function PreviewStep() {
  const { product } = useProductBuilderStore();
  
  const heroPhoto = product.photos?.[0] || null;
  const enabledAgeGroups = product.pricing?.ageGroups?.filter(ag => ag.enabled) || [];
  const highlights = product.content?.highlights?.filter(h => h.trim()) || [];
  const itinerary = product.content?.itinerary || [];
  const included = product.content?.included || [];
  const excluded = product.content?.excluded || [];
  const operatingDays = product.schedule?.operatingDays || [];
  const timeSlots = product.schedule?.timeSlots || [];
  const confirmationType = product.bookingRules?.confirmationType || "manual";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-slate-900">
          Preview Your Product
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review everything before submitting for review.
        </p>
      </div>

      {/* Product Card Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-emerald-600">
          {heroPhoto ? (
            <img
              src={typeof heroPhoto === 'string' ? heroPhoto : heroPhoto.url || URL.createObjectURL(heroPhoto)}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <MapPin size={32} className="mx-auto mb-2 opacity-75" />
                <p className="text-sm font-medium opacity-90">{product.city || "Location"}, {product.country || ""}</p>
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
              product.status === "active" 
                ? "bg-emerald-500 text-white" 
                : "bg-slate-800/80 text-white backdrop-blur-sm"
            }`}>
              {product.status === "active" ? (
                <>
                  <CheckCircle size={12} />
                  Live
                </>
              ) : (
                <>
                  <AlertCircle size={12} />
                  Draft
                </>
              )}
            </span>
          </div>

          {/* Pricing Badge */}
          {product.pricing?.schedules?.[0]?.prices?.length > 0 && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-900 shadow-lg">
                {product.pricing.currency} {product.pricing.schedules[0].prices[0]?.retailPrice || "—"}
                {product.pricing.pricingModel === "perPerson" ? " / person" : " / group"}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title & Location */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {product.title || "Untitled Product"}
            </h3>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {product.city || "—"}, {product.country || "—"}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {product.duration ? `${product.duration} ${product.durationUnit}` : "—"}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 py-4 border-y border-slate-100">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Tag size={18} className="text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500">Category</p>
              <p className="text-sm font-medium text-slate-800 capitalize">{product.category || "—"}</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users size={18} className="text-blue-600" />
              </div>
              <p className="text-xs text-slate-500">Max Group</p>
              <p className="text-sm font-medium text-slate-800">{product.pricing?.maxTravelersPerBooking || "—"}</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-amber-50 flex items-center justify-center">
                <DollarSign size={18} className="text-amber-600" />
              </div>
              <p className="text-xs text-slate-500">Currency</p>
              <p className="text-sm font-medium text-slate-800">{product.pricing?.currency || "—"}</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-purple-50 flex items-center justify-center">
                <Shield size={18} className="text-purple-600" />
              </div>
              <p className="text-xs text-slate-500">Booking</p>
              <p className="text-sm font-medium text-slate-800 capitalize">{confirmationType}</p>
            </div>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="py-4 border-b border-slate-100">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Highlights</h4>
              <div className="flex flex-wrap gap-2">
                {highlights.slice(0, 5).map((h, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    <CheckCircle size={10} />
                    {h}
                  </span>
                ))}
                {highlights.length > 5 && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                    +{highlights.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Age Groups */}
          {enabledAgeGroups.length > 0 && (
            <div className="py-4 border-b border-slate-100">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Age Groups</h4>
              <div className="flex flex-wrap gap-2">
                {enabledAgeGroups.map((ag, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                    {ag.name} ({ag.minAge}-{ag.maxAge})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary Preview */}
          {itinerary.length > 0 && (
            <div className="py-4 border-b border-slate-100">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Itinerary ({itinerary.length} stops)</h4>
              <div className="space-y-2">
                {itinerary.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-emerald-700">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-slate-800">{item.title || "Stop " + (i + 1)}</span>
                      {item.time && <span className="text-slate-400 ml-2">{item.time}</span>}
                    </div>
                  </div>
                ))}
                {itinerary.length > 3 && (
                  <p className="text-xs text-slate-400 ml-9">+{itinerary.length - 3} more stops</p>
                )}
              </div>
            </div>
          )}

          {/* Operating Days */}
          {operatingDays.length > 0 && (
            <div className="py-4 border-b border-slate-100">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Operating Days</h4>
              <div className="flex gap-2">
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                  const isActive = operatingDays.includes(day);
                  return (
                    <div
                      key={day}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium ${
                        isActive 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {day.slice(0, 2).toUpperCase()}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inclusions / Exclusions */}
          {(included.length > 0 || excluded.length > 0) && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                {included.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Included</h4>
                    <ul className="space-y-1">
                      {included.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                      {included.length > 3 && (
                        <li className="text-xs text-slate-400 ml-5">+{included.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
                {excluded.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Not Included</h4>
                    <ul className="space-y-1">
                      {excluded.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <AlertCircle size={12} className="text-slate-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                      {excluded.length > 3 && (
                        <li className="text-xs text-slate-400 ml-5">+{excluded.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Publish Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Publish Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { 
                value: "draft", 
                label: "Save as Draft", 
                desc: "Save your progress and publish later. You can come back anytime.", 
                icon: FileEdit,
                color: "slate"
              },
              { 
                value: "active", 
                label: "Publish Now", 
                desc: "Make your product live and visible to customers immediately.", 
                icon: Globe,
                color: "emerald"
              },
            ].map((status) => {
              const Icon = status.icon;
              const selected = product.status === status.value;
              return (
                <button
                  key={status.value}
                  onClick={() => useProductBuilderStore.getState().updateProduct({ status: status.value })}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? `border-${status.color}-600 bg-${status.color}-50 shadow-sm`
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      selected ? `bg-${status.color}-600 text-white` : "bg-slate-100 text-slate-400"
                    }`}>
                      <Icon size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <p className={`text-sm font-semibold ${selected ? `text-${status.color}-800` : "text-slate-800"}`}>
                          {status.label}
                        </p>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected ? `border-${status.color}-600` : "border-slate-200"
                        }`}>
                          {selected && <div className={`w-2.5 h-2.5 rounded-full bg-${status.color}-600`} />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{status.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
