// Single calculation source for every page (estimator, dashboard, breakdown, PDF).
// Plinth Area Method: Cost = Total Plinth Area × Applicable Rate per sq ft.

export const BUILDING_TYPES = ["Residential", "Commercial", "Industrial", "Institutional"] as const;
export const QUALITIES = ["Poor", "Standard", "High"] as const;
export const LOCATIONS = ["Metropolitan", "Urban", "Semi-Urban", "Rural"] as const;
export const CATEGORIES = ["Materials", "Labour", "Equipment & Transportation", "Other Included Expenses"] as const;

export type BuildingType = (typeof BUILDING_TYPES)[number];
export type Quality = (typeof QUALITIES)[number];
export type LocationCat = (typeof LOCATIONS)[number];
export type Category = (typeof CATEGORIES)[number];
export type AreaMode = "perFloor" | "total";

export interface Inputs {
  projectName: string;
  buildingType: BuildingType;
  areaMode: AreaMode;
  area: number;
  floors: number;
  quality: Quality;
  location: LocationCat;
  state: string;
  city: string;
}

/** Rates (₹/sq ft) supplied by the user from a validated source, keyed by type|quality|location. */
export type RateTable = Record<string, number>;
export interface RateData {
  rates: RateTable;
  source: string;
  /** Allocation % per category from a documented source; must total 100. */
  allocation: Partial<Record<Category, number>>;
  allocationSource: string;
}

export const rateKey = (t: BuildingType, q: Quality, l: LocationCat) => `${t}|${q}|${l}`;

export function totalPlinthArea(i: Pick<Inputs, "area" | "floors" | "areaMode">): number {
  const a = Number(i.area) || 0;
  const f = Math.max(1, Math.floor(Number(i.floors) || 1));
  return i.areaMode === "perFloor" ? a * f : a;
}

export type Estimate =
  | { ok: false; missing: string[] }
  | {
      ok: true;
      totalArea: number;
      rate: number;
      total: number;
      costPerSqFt: number;
      allocations: { category: Category; percent: number; amount: number }[] | null;
      allocationMissing: string | null;
    };

export function allocate(total: number, alloc: RateData["allocation"]) {
  const pcts = CATEGORIES.map((c) => alloc[c]);
  if (pcts.some((p) => p === undefined || p === null || isNaN(p as number) || (p as number) < 0))
    return { error: "Allocation percentages are missing for one or more categories." };
  const sum = (pcts as number[]).reduce((s, p) => s + p, 0);
  if (Math.abs(sum - 100) > 1e-6) return { error: `Allocation percentages total ${sum}%, they must total exactly 100%.` };
  // Round to whole rupees; last category absorbs rounding so the sum equals the total exactly.
  const rows = CATEGORIES.map((c, i) => ({ category: c, percent: pcts[i] as number, amount: Math.round((total * (pcts[i] as number)) / 100) }));
  const diff = total - rows.reduce((s, r) => s + r.amount, 0);
  rows[rows.length - 1]!.amount += diff;
  return { rows };
}

export function estimate(i: Inputs, d: RateData): Estimate {
  const missing: string[] = [];
  if (!(i.area > 0)) missing.push("Plinth area (sq ft) must be greater than 0");
  if (i.areaMode === "perFloor" && !(i.floors >= 1)) missing.push("Number of floors must be at least 1");
  const rate = d.rates[rateKey(i.buildingType, i.quality, i.location)] ?? 0;
  if (!(rate > 0))
    missing.push(`Validated rate for ${i.buildingType} · ${i.quality} quality · ${i.location} — add it on the Rates page`);
  if (missing.length) return { ok: false, missing };
  const totalArea = totalPlinthArea(i);
  // Rate is already location-specific, so no further location factor is applied.
  const total = Math.round(totalArea * rate);
  const a = allocate(total, d.allocation);
  return {
    ok: true,
    totalArea,
    rate,
    total,
    costPerSqFt: total / totalArea,
    allocations: "rows" in a ? a.rows! : null,
    allocationMissing: "error" in a ? a.error! : null,
  };
}

export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
export const inr2 = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
