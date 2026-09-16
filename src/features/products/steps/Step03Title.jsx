import { useProductBuilderStore } from '@/features/products/productBuilderStore'
import { useStepErrors } from '@/features/products/useStepErrors'
import { TITLE_MAX_CHARS, REFERENCE_CODE_MAX_CHARS, limitMessage } from '@/features/products/productFormSchema'

const PLATFORM_PRESETS = [
  { key: 'google', label: 'Google Business / Google Maps URL', placeholder: 'https://...' },
  { key: 'tripadvisor', label: 'Tripadvisor URL', placeholder: 'https://...' },
  { key: 'getyourguide', label: 'GetYourGuide URL', placeholder: 'https://...' },
  { key: 'other', label: 'Other review platform URL', placeholder: 'https://...' },
]

export default function Step03Title() {
  const title = useProductBuilderStore((s) => s.title)
  const referenceCode = useProductBuilderStore((s) => s.referenceCode)
  const externalReviews = useProductBuilderStore((s) => s.externalReviews)
  const setField = useProductBuilderStore((s) => s.setField)
  const errors = useStepErrors(2)

  const titleAtLimit = title.length >= TITLE_MAX_CHARS
  const refCodeAtLimit = referenceCode.length >= REFERENCE_CODE_MAX_CHARS

  const updateReview = (index, field, value) => {
    const next = [...externalReviews]
    next[index] = { ...next[index], [field]: value }
    setField('externalReviews', next)
  }

  const addPlatform = () => {
    setField('externalReviews', [...externalReviews, { platform: '', url: '' }])
  }

  const removePlatform = (index) => {
    setField('externalReviews', externalReviews.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-[720px]">
      {/* ── Title ── */}
      <div className="mb-5">
        <label className="block text-sm font-semibold mb-2 text-slate-800">Product title *</label>
        <input
          data-field="title"
          className={`w-full min-h-[46px] rounded-xl border bg-white px-3.5 py-2.5 text-sm transition-all focus-ring ${
            titleAtLimit ? 'border-red-300 text-red-600' : 'border-slate-200'
          }`}
          type="text"
          value={title}
          onChange={(e) => setField('title', e.target.value)}
          maxLength={TITLE_MAX_CHARS}
          aria-invalid={!!errors.title || titleAtLimit}
          placeholder="e.g. Paris: Eiffel Tower Priority Access Tour"
        />
        {errors.title ? (
          <span aria-live="polite" className="text-[13px] text-red-600 font-medium mt-1 flex items-center gap-1">{errors.title[0]}</span>
        ) : titleAtLimit ? (
          <span aria-live="polite" className="text-[13px] text-red-600 font-medium mt-1 flex items-center gap-1">{limitMessage(TITLE_MAX_CHARS)}</span>
        ) : null}
        <div className="flex items-center justify-between mt-1.5 gap-3">
          <p className="text-[13px] text-slate-500 leading-relaxed">
            Describe the experience. Keep it clear and specific, avoid prices and promotional wording.
          </p>
          <span className={`text-[13px] tabular-nums shrink-0 ${titleAtLimit ? 'text-red-600 font-medium' : title.length > 0 ? 'text-slate-500' : 'text-slate-400'}`}>
            {title.length} / {TITLE_MAX_CHARS}
          </span>
        </div>
      </div>

      {/* ── Reference Code ── */}
      <div className="mb-5">
        <label className="block text-sm font-semibold mb-2 text-slate-800">Product reference code</label>
        <input
          data-field="referenceCode"
          className={`w-full min-h-[46px] rounded-xl border bg-white px-3.5 py-2.5 text-sm transition-all focus-ring ${
            refCodeAtLimit ? 'border-red-300 text-red-600' : 'border-slate-200'
          }`}
          type="text"
          value={referenceCode}
          onChange={(e) => setField('referenceCode', e.target.value)}
          maxLength={REFERENCE_CODE_MAX_CHARS}
          aria-invalid={!!errors.referenceCode || refCodeAtLimit}
          placeholder="Internal code (optional)"
        />
        {errors.referenceCode ? (
          <span aria-live="polite" className="text-[13px] text-red-600 font-medium mt-1 flex items-center gap-1">{errors.referenceCode[0]}</span>
        ) : refCodeAtLimit ? (
          <span aria-live="polite" className="text-[13px] text-red-600 font-medium mt-1 flex items-center gap-1">{limitMessage(REFERENCE_CODE_MAX_CHARS)}</span>
        ) : null}
        <div className="flex items-center justify-between mt-1.5 gap-3">
          <p className="text-[13px] text-slate-500 leading-relaxed">
            An internal code to help you identify this product. Not shown to customers.
          </p>
          <span className={`text-[13px] tabular-nums shrink-0 ${refCodeAtLimit ? 'text-red-600 font-medium' : referenceCode.length > 0 ? 'text-slate-500' : 'text-slate-400'}`}>
            {referenceCode.length} / {REFERENCE_CODE_MAX_CHARS}
          </span>
        </div>
      </div>

      {/* ── Reviews from other platforms ── */}
      <div className="mb-5 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="text-base font-semibold text-slate-800">Reviews from other platforms</h3>
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[12px] font-medium text-teal-700">Optional</span>
        </div>
        <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
          Does this product already have reviews on other platforms? Add links so we can verify and import eligible reviews.
        </p>

        <div className="space-y-3">
          {PLATFORM_PRESETS.map((preset, i) => {
            const entry = externalReviews[i]
            const value = entry?.url || ''
            return (
              <div key={preset.key}>
                <label className="block text-[13px] font-medium mb-1.5 text-slate-700">{preset.label}</label>
                <input
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm transition-all focus-ring"
                  type="url"
                  value={value}
                  onChange={(e) => {
                    const next = [...externalReviews]
                    while (next.length <= i) next.push({ platform: preset.key, url: '' })
                    next[i] = { platform: preset.key, url: e.target.value }
                    setField('externalReviews', next)
                  }}
                  placeholder={preset.placeholder}
                />
              </div>
            )
          })}

          {/* Extra custom platforms */}
          {externalReviews.slice(PLATFORM_PRESETS.length).map((entry, i) => {
            const idx = PLATFORM_PRESETS.length + i
            return (
              <div key={idx} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[13px] font-medium mb-1.5 text-slate-700">Platform name</label>
                  <input
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm transition-all focus-ring"
                    type="text"
                    value={entry.platform || ''}
                    onChange={(e) => updateReview(idx, 'platform', e.target.value)}
                    placeholder="e.g. Viator"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[13px] font-medium mb-1.5 text-slate-700">Review URL</label>
                  <input
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm transition-all focus-ring"
                    type="url"
                    value={entry.url || ''}
                    onChange={(e) => updateReview(idx, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePlatform(idx)}
                  className="min-h-[44px] px-3 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors text-sm font-medium shrink-0"
                  aria-label="Remove platform"
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={addPlatform}
          className="mt-3 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          + Add another platform
        </button>

        {externalReviews.length > 0 && (
          <div className="mt-4 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="review-confirm"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="review-confirm" className="text-[13px] text-slate-600 leading-relaxed cursor-pointer">
              I confirm these links belong to my business or this experience.
            </label>
          </div>
        )}

        {externalReviews.length > 0 && (
          <p className="mt-2.5 text-[12px] text-slate-400 leading-relaxed">
            Imported reviews will be labelled with their original source platform.
          </p>
        )}
      </div>
    </div>
  )
}
