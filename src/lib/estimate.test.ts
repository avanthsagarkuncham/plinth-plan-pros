import { describe, it, expect } from "vitest";
import { estimate, totalPlinthArea, rateKey, type Inputs, type RateData } from "./estimate";

const base: Inputs = { projectName: "", buildingType: "Residential", areaMode: "perFloor", area: 1000, floors: 2, quality: "Standard", location: "Urban", state: "", city: "" };
const data: RateData = { rates: { [rateKey("Residential", "Standard", "Urban")]: 1800 }, source: "", allocation: { Materials: 55.5, Labour: 25.25, "Equipment & Transportation": 9.25, "Other Included Expenses": 10 }, allocationSource: "" };

describe("plinth area method", () => {
  it("multiplies per-floor area by floors", () => expect(totalPlinthArea(base)).toBe(2000));
  it("uses total area directly", () => expect(totalPlinthArea({ ...base, areaMode: "total" })).toBe(1000));
  it("cost = area × rate", () => { const e = estimate(base, data); expect(e.ok && e.total).toBe(3_600_000); });
  it("cost per sq ft equals rate", () => { const e = estimate({ ...base, area: 1333 }, data); expect(e.ok && Math.round(e.costPerSqFt)).toBe(1800); });
  it("allocations sum exactly to total", () => { const e = estimate({ ...base, area: 1337 }, data); if (!e.ok) throw 0; expect(e.allocations!.reduce((s, r) => s + r.amount, 0)).toBe(e.total); });
  it("refuses to estimate without a rate", () => expect(estimate({ ...base, quality: "High" }, data).ok).toBe(false));
});
