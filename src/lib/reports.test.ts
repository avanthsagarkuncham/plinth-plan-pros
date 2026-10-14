import { describe, expect, it } from "vitest";
import { estimate, rateKey, type Inputs, type RateData } from "./estimate";
import { buildReportRow, reportSnapshot, type Report } from "./reports";

const inputs: Inputs = { projectName: "P", buildingType: "Residential", areaMode: "perFloor", area: 1000, floors: 2, quality: "Standard", location: "Urban", state: "KA", city: "Mysuru" };
const data: RateData = { rates: { [rateKey("Residential", "Standard", "Urban")]: 1800 }, source: "Sample", allocation: { Materials: 60, Labour: 25, "Equipment & Transportation": 10, "Other Included Expenses": 5 }, allocationSource: "Sample" };

describe("saved reports", () => {
  it("saves the exact estimate values and reopens them unchanged", () => {
    const r = estimate(inputs, data);
    if (!r.ok) throw new Error("expected ok");
    const row = buildReportRow(inputs, data, r, { report_name: "R", project_name: "P", notes: "" });
    expect(row.total_plinth_area).toBe(2000);
    expect(row.estimated_total_cost).toBe(3600000);
    const snap = reportSnapshot({ ...row, id: "x", user_id: "u", created_at: "", updated_at: "" } as Report);
    expect(snap.result.total).toBe(3600000);
    expect(snap.result.costPerSqFt).toBe(1800);
    expect(snap.result.allocations!.reduce((s, a) => s + a.amount, 0)).toBe(3600000);
  });

  it("keeps saved values when current rates change later", () => {
    const r = estimate(inputs, data);
    if (!r.ok) throw new Error("expected ok");
    const row = buildReportRow(inputs, data, r, { report_name: "R", project_name: "P", notes: "" });
    data.rates[rateKey("Residential", "Standard", "Urban")] = 2500;
    const snap = reportSnapshot({ ...row, id: "x", user_id: "u", created_at: "", updated_at: "" } as Report);
    expect(snap.result.rate).toBe(1800);
  });
});
