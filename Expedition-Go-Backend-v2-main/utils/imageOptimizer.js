function cloudinaryUrl(url, width = 800) {
  if (typeof url !== 'string') return url;

  const { CLOUDINARY_CLOUD_NAME } = process.env;

  // If it's already a full URL (absolute), return it unchanged.
  // URLs stored in the DB from Cloudinary uploads are already full and
  // optimized — no need to re-transform and risk double-transformation bugs.
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // Bare public ID (e.g. "user-photos/abc123") — construct the full URL.
  if (CLOUDINARY_CLOUD_NAME) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},q_auto,f_auto/v1/${url}`;
  }

  // No Cloudinary env configured — return as-is with a warning.
  console.warn('CLOUDINARY_CLOUD_NAME not set — cannot construct Cloudinary URL for:', url);
  return url;
}

module.exports = { cloudinaryUrl };
