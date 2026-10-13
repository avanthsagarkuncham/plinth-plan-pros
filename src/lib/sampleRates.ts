import { BUILDING_TYPES, LOCATIONS, QUALITIES, rateKey, type RateData } from "./estimate";

// Illustrative sample values — NOT verified official market rates (not CPWD/PWD).
const TABLES: Record<(typeof BUILDING_TYPES)[number], number[][]> = {
  // rows: Poor, Standard, High — columns: Metropolitan, Urban, Semi-Urban, Rural
  Residential: [
    [1700, 1500, 1350, 1200],
    [2200, 1800, 1650, 1500],
    [2800, 2300, 2100, 1900],
  ],
  Commercial: [
    [1900, 1700, 1500, 1350],
    [2500, 2100, 1900, 1700],
    [3200, 2700, 2450, 2200],
  ],
  Industrial: [
    [1600, 1450, 1300, 1200],
    [2100, 1850, 1650, 1500],
    [2700, 2400, 2150, 1950],
  ],
  Institutional: [
    [1800, 1600, 1450, 1300],
    [2400, 2000, 1800, 1650],
    [3000, 2600, 2350, 2100],
  ],
};

export function sampleRateData(): RateData {
  const rates: RateData["rates"] = {};
  for (const t of BUILDING_TYPES)
    QUALITIES.forEach((q, qi) =>
      LOCATIONS.forEach((l, li) => {
        rates[rateKey(t, q, l)] = TABLES[t][qi]![li]!;
      }),
    );
  return {
    rates,
    source: "Illustrative sample rates - not validated",
    allocation: { Materials: 60, Labour: 25, "Equipment & Transportation": 10, "Other Included Expenses": 5 },
    allocationSource: "Illustrative sample allocation - not validated",
  };
}
