import { useState } from "react";
import { Sparkles, Upload, Zap } from "lucide-react";
import { toast } from "sonner";

export default function SmartCreatorStep() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedFile && !description.trim()) {
      toast.error("Please upload an image or enter a description to get started.");
      return;
    }
    setGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setGenerating(false);
    toast.success("Smart Creator is coming soon! Your inputs are saved for future use.");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-800">
          Smart Creator
        </h3>
        <p className="text-sm text-slate-500">
          Upload images or describe your product, and let AI auto-generate your listing content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Upload */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-800">
            Upload Product Images
          </label>
          <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all">
            <Upload size={32} className="text-slate-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                {uploadedFile ? uploadedFile.name : "Click to upload images"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                JPG, PNG or WebP (max 5MB)
              </p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {uploadedFile && (
            <button
              type="button"
              onClick={() => setUploadedFile(null)}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Remove file
            </button>
          )}
        </div>

        {/* Description Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-800">
            Or describe your product
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., A guided walking tour through the historic streets of Accra, visiting cultural landmarks and local markets..."
            rows={6}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/20"
        >
          {generating ? (
            <>
              <Sparkles size={16} className="animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Zap size={16} />
              Generate with AI
            </>
          )}
        </button>
        <span className="text-xs text-slate-400">or skip and fill manually</span>
      </div>

      {/* Tips */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-2">
          <Sparkles size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Tips for best results:</p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-700">
              <li>Upload high-quality images showing different angles and experiences</li>
              <li>Include key details like duration, group size, and highlights in your description</li>
              <li>Mention included services (meals, equipment, guides) for better auto-generation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
