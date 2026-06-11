export function optimizeImage(urlOrObj, displaySize = 40) {
  const url = typeof urlOrObj === 'string' ? urlOrObj : urlOrObj?.url || urlOrObj;
  if (!url || typeof url !== 'string') return urlOrObj;

  const retinaSize = displaySize * 2;

  if (url.includes('googleusercontent.com') || url.includes('googleapis.com')) return url;

  if (url.includes('res.cloudinary.com')) {
    const marker = '/upload/';
    const idx = url.indexOf(marker);
    if (idx === -1) return url;
    const before = url.slice(0, idx + marker.length);
    const after = url.slice(idx + marker.length);
    return `${before}w_${retinaSize},q_80,f_auto/${after}`;
  }

  return url;
}
