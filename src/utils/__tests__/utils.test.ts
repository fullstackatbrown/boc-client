import { describe, it, expect } from "vitest";
import { classCombination, formatCost, tripCost } from "../utils";

describe("classCombination", () => {
  it("uses one class when the cost is at most $50", () => {
    expect(classCombination(20)).toEqual(["D"]);
    expect(classCombination(5)).toEqual(["A"]);
    expect(classCombination(50)).toEqual(["J"]);
  });
  it("tops up Class J with the class for the remainder", () => {
    expect(classCombination(85)).toEqual(["G", "J"]);
    expect(classCombination(120)).toEqual(["D", "J", "J"]);
    expect(classCombination(100)).toEqual(["J", "J"]);
  });
});

describe("tripCost", () => {
  it("reads the class price or the override", () => {
    expect(tripCost({ class: "C", priceOverride: null })).toBe(15);
    expect(tripCost({ class: "Z", priceOverride: null })).toBe(0);
    expect(tripCost({ class: null, priceOverride: 85 })).toBe(85);
    expect(tripCost({ class: null, priceOverride: null })).toBeNull();
  });
});

describe("formatCost", () => {
  it("formats free, priced, and unset costs", () => {
    expect(formatCost(0)).toBe("Free!");
    expect(formatCost(12.5)).toBe("$12.5");
    expect(formatCost(null)).toBe("Not set");
  });
});
