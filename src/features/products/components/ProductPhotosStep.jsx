import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, Trash2, AlertTriangle } from "lucide-react";
import { useProductBuilderStore } from "@/features/products/stores/productBuilderStore";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;
const MIN_DIMENSIONS = { width: 800, height: 600 };
const MAX_DIMENSIONS = { width: 4096, height: 4096 };

function getImageDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

const VALIDATION_ERRORS = {
  type: (name) => `${name}: unsupported format. Use JPG, PNG, or WebP.`,
  size: (name) => `${name}: exceeds 5MB limit.`,
  dimensions: (name) => `${name}: minimum 800x600, maximum 4096x4096 pixels.`,
};

export default function ProductPhotosStep() {
  const { product, updateProduct } = useProductBuilderStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);
  const prevPhotoIdsRef = useRef([]);

  useEffect(() => {
    const currentIds = product.photos.map((p) => p.id);
    const prevIds = prevPhotoIdsRef.current;
    const removed = prevIds.filter((id) => !currentIds.includes(id));
    removed.forEach((id) => {
      const photo = product.photos.find((p) => p.id === id);
      if (!photo) {
        const prevPhotos = useProductBuilderStore.getState().product.photos;
        const found = prevPhotos.find((p) => p.id === id);
        if (found?.url?.startsWith("blob:")) URL.revokeObjectURL(found.url);
      }
    });
    prevPhotoIdsRef.current = currentIds;
  }, [product.photos]);

  const processFiles = useCallback(async (files) => {
    const currentPhotos = useProductBuilderStore.getState().product.photos;
    const errors = [];
    const validFiles = [];

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(VALIDATION_ERRORS.type(file.name));
        continue;
      }
      if (file.size > MAX_SIZE) {
        errors.push(VALIDATION_ERRORS.size(file.name));
        continue;
      }
      const dims = await getImageDimensions(file);
      if (!dims) {
        errors.push(`${file.name}: could not read image.`);
        continue;
      }
      if (
        dims.width < MIN_DIMENSIONS.width ||
        dims.height < MIN_DIMENSIONS.height ||
        dims.width > MAX_DIMENSIONS.width ||
        dims.height > MAX_DIMENSIONS.height
      ) {
        errors.push(VALIDATION_ERRORS.dimensions(file.name));
        continue;
      }
      validFiles.push(file);
    }

    setValidationErrors(errors);

    if (validFiles.length > 0) {
      const newPhotos = validFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file),
        file,
        alt: "",
      }));
      updateProduct({ photos: [...currentPhotos, ...newPhotos] });
    }
  }, [updateProduct]);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files?.length) {
      processFiles(files);
    }
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer?.files;
    if (files?.length) {
      processFiles(files);
    }
  };

  const handleClickUpload = () => {
    setValidationErrors([]);
    fileInputRef.current?.click();
  };

  const removePhoto = (id) => {
    const photo = product.photos.find((p) => p.id === id);
    if (photo?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(photo.url);
    }
    const updated = {
      photos: product.photos.filter((p) => p.id !== id),
    };
    if (product.heroImage === id) {
      updated.heroImage = null;
    }
    updateProduct(updated);
  };

  const setHero = (id) => {
    updateProduct({ heroImage: id });
  };

  const updateAlt = (id, alt) => {
    const newPhotos = product.photos.map((p) =>
      p.id === id ? { ...p, alt } : p
    );
    updateProduct({ photos: newPhotos });
  };

  return (
    <div className="space-y-6">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-1">
          <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-1">
            <AlertTriangle size={16} />
            <span>{validationErrors.length} file{validationErrors.length > 1 ? "s" : ""} rejected</span>
          </div>
          {validationErrors.map((err, i) => (
            <p key={i} className="text-xs text-red-600 ml-6">{err}</p>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? "border-emerald-600 bg-emerald-50"
            : "border-slate-200 bg-slate-50 hover:border-emerald-600 hover:bg-emerald-50/50"
        }`}
      >
        <Upload size={40} className="mx-auto text-slate-400 mb-3" />
        <p className="text-sm font-medium text-slate-800 mb-1">
          Drag and drop photos here, or{" "}
          <span className="text-emerald-600 hover:underline">browse</span> to choose files
        </p>
        <p className="text-xs text-slate-500">Supports JPG, PNG, WebP. Max 5MB per image. Min 800x600px.</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Photo Gallery */}
      {product.photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Photos ({product.photos.length})</h3>
            <p className="text-xs text-slate-500">
              {product.heroImage ? "Thumbnail selected" : "Select a thumbnail for your product"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {product.photos.map((photo) => (
              <div
                key={photo.id}
                className={`group relative rounded-xl border overflow-hidden ${
                  product.heroImage === photo.id ? "border-emerald-600 ring-2 ring-emerald-600/20" : "border-slate-200"
                }`}
              >
                <div className="aspect-[4/3] bg-slate-50 relative">
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('ProductPhotosStep photo failed:', e.target.src);
                      e.target.style.display = 'none';
                    }}
                  />
                  {product.heroImage === photo.id && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md">
                      THUMBNAIL
                    </div>
                  )}
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-md bg-white/90 text-slate-400 hover:text-red-500 shadow-sm opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    title="Remove photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-2 space-y-2">
                  <input
                    type="text"
                    value={photo.alt}
                    onChange={(e) => updateAlt(photo.id, e.target.value)}
                    placeholder="Alt text"
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    onClick={() => setHero(photo.id)}
                    className={`w-full text-[11px] font-medium py-1 rounded transition-colors ${
                      product.heroImage === photo.id
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-400 hover:text-emerald-600 hover:bg-slate-50"
                    }`}
                  >
                    {product.heroImage === photo.id ? "Thumbnail \u2713" : "Set as thumbnail"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
