import { describe, expect, it } from "vitest";
import { getAverageRating, getLiveSuggestions, formatPrice } from "../client/src/pages/Home";

describe("Miraju localized pricing", () => {
  it("formats Turkish prices in TRY", () => {
    expect(formatPrice(2890, "tr")).toBe("₺2.890");
  });

  it("converts catalog display prices for English and German", () => {
    expect(formatPrice(2890, "en")).toBe("$85");
    expect(formatPrice(2890, "de")).toContain("83");
    expect(formatPrice(2890, "de")).toContain("€");
  });
});

describe("Miraju discovery interactions", () => {
  const catalog = [
    { id: 1, name: "Luna keten gömlek", category: "Kadın", price: 2890, image: "", color: "Kum", description: "" },
    { id: 2, name: "Noma deri çanta", category: "Aksesuar", price: 3490, image: "", color: "Tütün", description: "" },
  ];

  it("returns matching live suggestions and caps the list", () => {
    expect(getLiveSuggestions("keten", catalog).map((item) => item.id)).toEqual([1]);
    expect(getLiveSuggestions("", catalog)).toHaveLength(2);
  });

  it("calculates a stable average rating", () => {
    expect(getAverageRating([{ id: 1, name: "A", rating: 5, text: "", date: "" }, { id: 2, name: "B", rating: 4, text: "", date: "" }])).toBe(4.5);
    expect(getAverageRating([])).toBe(0);
  });
});
