import { describe, it, expect } from "vitest";
import { normalizeHighlights } from "../normalizeHighlights";

describe("normalizeHighlights", () => {
  it("returns trimmed non-empty strings from an array", () => {
    expect(normalizeHighlights([" Visit markets ", "", "Guided walk"])).toEqual([
      "Visit markets",
      "Guided walk",
    ]);
  });

  it("splits multiline strings into an array", () => {
    expect(normalizeHighlights("First highlight\nSecond highlight")).toEqual([
      "First highlight",
      "Second highlight",
    ]);
  });

  it("returns an empty array for invalid values", () => {
    expect(normalizeHighlights(null)).toEqual([]);
    expect(normalizeHighlights(undefined)).toEqual([]);
    expect(normalizeHighlights("")).toEqual([]);
  });
});
