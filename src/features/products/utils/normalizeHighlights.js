export function normalizeHighlights(highlights) {
  if (Array.isArray(highlights)) {
    return highlights.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof highlights === "string" && highlights.trim()) {
    return highlights
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}
