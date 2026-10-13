import { describe, it, expect } from "vitest";
import { sampleRateData } from "./sampleRates";
import { CATEGORIES, rateKey } from "./estimate";

describe("sample rates", () => {
  const d = sampleRateData();
  it("marks the source as illustrative, not validated", () => {
    expect(d.source).toBe("Illustrative sample rates - not validated");
    expect(d.source).not.toMatch(/CPWD|PWD/);
  });
  it("fills all 48 type/quality/location combinations", () => expect(Object.keys(d.rates)).toHaveLength(48));
  it("Residential Standard Urban is 1800", () => expect(d.rates[rateKey("Residential", "Standard", "Urban")]).toBe(1800));
  it("Commercial High Metropolitan is 3200", () => expect(d.rates[rateKey("Commercial", "High", "Metropolitan")]).toBe(3200));
  it("Industrial Poor Rural is 1200", () => expect(d.rates[rateKey("Industrial", "Poor", "Rural")]).toBe(1200));
  it("Institutional High Semi-Urban is 2350", () => expect(d.rates[rateKey("Institutional", "High", "Semi-Urban")]).toBe(2350));
  it("allocation percentages total exactly 100", () => {
    expect(CATEGORIES.reduce((s, c) => s + (d.allocation[c] ?? 0), 0)).toBe(100);
  });
  it("allocation is Materials 60, Labour 25, Equipment 10, Other 5", () => {
    expect(d.allocation).toEqual({ Materials: 60, Labour: 25, "Equipment & Transportation": 10, "Other Included Expenses": 5 });
  });
});
