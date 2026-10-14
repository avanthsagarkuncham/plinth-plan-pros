import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import type { Category, Estimate, Inputs, RateData } from "./estimate";

export type Report = Tables<"saved_reports">;
export type OkEstimate = Extract<Estimate, { ok: true }>;

export const ASSUMPTIONS = [
  "Estimate uses the Plinth Area Method only; no item-rate or material quantity take-off.",
  "Rate is location-specific; no additional location factor is applied.",
  "Allocations are proportional shares of the total, not material quantities.",
  "Totals are rounded to the nearest rupee; rounding is absorbed by the last category.",
];
export const EXCLUSIONS = [
  "Land cost, approvals and statutory fees",
  "Interior furnishing and loose fittings",
  "External development, compound wall and landscaping",
  "Price escalation after the rate date, GST unless included in the rate",
];

export const defaultReportName = (d = new Date()) =>
  `Construction Estimate - ${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;

interface StoredAssumptions { items: string[]; exclusions: string[]; allocation: RateData["allocation"]; allocationSource: string; allocationMissing: string | null }

/** Snapshot of the calculator state; values come straight from the shared estimate() result. */
export function buildReportRow(i: Inputs, d: RateData, r: OkEstimate, meta: { report_name: string; project_name: string; notes: string }): TablesInsert<"saved_reports"> {
  const assumptions: StoredAssumptions = { items: ASSUMPTIONS, exclusions: EXCLUSIONS, allocation: d.allocation, allocationSource: d.allocationSource, allocationMissing: r.allocationMissing };
  return {
    ...meta,
    building_type: i.buildingType, construction_quality: i.quality, location_category: i.location,
    city: i.city, state: i.state, area_mode: i.areaMode,
    area_per_floor: i.areaMode === "perFloor" ? i.area : null,
    total_plinth_area: r.totalArea, floors: i.floors, rate_per_sqft: r.rate, estimated_total_cost: r.total,
    cost_allocations: r.allocations as never, estimate_inputs: { ...i, projectName: meta.project_name } as never,
    assumptions: assumptions as never, rate_source: d.source,
  };
}

/** Rebuild the saved values (no recalculation) for display and PDF. */
export function reportSnapshot(rep: Report): { inputs: Inputs; data: RateData; result: OkEstimate; assumptions: StoredAssumptions } {
  const a = (rep.assumptions ?? {}) as unknown as Partial<StoredAssumptions>;
  const inputs = rep.estimate_inputs as unknown as Inputs;
  const total = Number(rep.estimated_total_cost), totalArea = Number(rep.total_plinth_area);
  const allocations = (rep.cost_allocations as unknown as { category: Category; percent: number; amount: number }[] | null) ?? null;
  return {
    inputs: { ...inputs, projectName: rep.project_name || inputs.projectName },
    data: { rates: {}, source: rep.rate_source, allocation: a.allocation ?? {}, allocationSource: a.allocationSource ?? "" },
    result: { ok: true, totalArea, rate: Number(rep.rate_per_sqft), total, costPerSqFt: total / totalArea, allocations, allocationMissing: allocations ? null : a.allocationMissing ?? "Allocation not saved." },
    assumptions: { items: a.items ?? ASSUMPTIONS, exclusions: a.exclusions ?? EXCLUSIONS, allocation: a.allocation ?? {}, allocationSource: a.allocationSource ?? "", allocationMissing: a.allocationMissing ?? null },
  };
}

export const shortId = (id: string) => id.slice(0, 8).toUpperCase();
