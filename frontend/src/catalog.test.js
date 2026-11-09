import { describe, expect, it } from "vitest";
import { getCategoryName, isValidName } from "./catalog.js";

describe("catalog helpers", () => {
  it("accepts non-empty names and rejects blank names", () => {
    expect(isValidName("Hogar")).toBe(true);
    expect(isValidName("   ")).toBe(false);
  });

  it("finds a category name using a numeric or string ID", () => {
    const categories = [{ id: 2, nombre: "Hogar" }];

    expect(getCategoryName(categories, 2)).toBe("Hogar");
    expect(getCategoryName(categories, "2")).toBe("Hogar");
  });

  it("returns an empty name when the category does not exist", () => {
    expect(getCategoryName([], 99)).toBe("");
  });
});
