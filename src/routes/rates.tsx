import { createFileRoute } from "@tanstack/react-router";
import { Shell, Panel } from "@/components/Shell";
import { useEstimate } from "@/lib/store";
import { BUILDING_TYPES, CATEGORIES, LOCATIONS, QUALITIES, rateKey, type BuildingType } from "@/lib/estimate";
import { useState } from "react";

export const Route = createFileRoute("/rates")({
  head: () => ({
    meta: [
      { title: "Validated Rates · Plinth Area Cost" },
      { name: "description", content: "Enter validated plinth area rates per sq ft and documented cost allocation percentages." },
      { property: "og:title", content: "Validated Rates · Plinth Area Cost" },
      { property: "og:description", content: "Manage the rate dataset used for every estimate." },
    ],
  }),
  component: Rates,
});

const cell = "w-24 rounded border border-input bg-input/40 px-2 py-1 text-right text-sm tabular-nums outline-none focus:border-cyan";
const field = "w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm outline-none focus:border-cyan";

function Rates() {
  const { data, setData } = useEstimate();
  const [type, setType] = useState<BuildingType>("Residential");
  const sum = CATEGORIES.reduce((s, c) => s + (data.allocation[c] ?? 0), 0);
  return (
    <Shell>
      <h1 className="mb-2 font-display text-3xl">Validated Rates</h1>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">Enter plinth area rates (₹/sq ft) from an authoritative source such as your state PWD / CPWD Plinth Area Rates schedule. Each rate is location-specific, so no extra location factor is applied. Blank cells mean no estimate is shown for that combination.</p>
      <div className="grid gap-6">
        <Panel title="Rate table">
          <div className="mb-4 flex flex-wrap gap-2">{BUILDING_TYPES.map((t) => <button key={t} onClick={() => setType(t)} className={t === type ? "btn-gold" : "btn-ghost"}>{t}</button>)}</div>
          <div className="overflow-x-auto">
            <table className="text-sm">
              <thead><tr><th className="pr-4 text-left text-xs text-muted-foreground">Quality \ Location</th>{LOCATIONS.map((l) => <th key={l} className="px-2 pb-2 text-xs text-cyan">{l}</th>)}</tr></thead>
              <tbody>{QUALITIES.map((q) => (
                <tr key={q}><td className="pr-4 py-1.5">{q}</td>{LOCATIONS.map((l) => {
                  const k = rateKey(type, q, l);
                  return <td key={l} className="px-2"><input type="number" min={0} className={cell} value={data.rates[k] ?? ""} placeholder="—" onChange={(e) => { const rates = { ...data.rates }; const v = Number(e.target.value); if (e.target.value === "" || !(v > 0)) delete rates[k]; else rates[k] = v; setData({ ...data, rates }); }} /></td>;
                })}</tr>
              ))}</tbody>
            </table>
          </div>
          <label className="mt-4 block space-y-1.5"><span className="text-xs uppercase tracking-wider text-muted-foreground">Rate source & date</span><input className={field} value={data.source} placeholder="e.g. CPWD Plinth Area Rates, base date …" onChange={(e) => setData({ ...data, source: e.target.value })} /></label>
        </Panel>
        <Panel title="Cost allocation percentages">
          <div className="grid gap-3 sm:grid-cols-2">{CATEGORIES.map((c) => (
            <label key={c} className="flex items-center justify-between gap-3 text-sm">{c}<span className="flex items-center gap-1"><input type="number" min={0} max={100} step="0.01" className={cell} value={data.allocation[c] ?? ""} onChange={(e) => { const allocation = { ...data.allocation }; if (e.target.value === "") delete allocation[c]; else allocation[c] = Number(e.target.value); setData({ ...data, allocation }); }} />%</span></label>
          ))}</div>
          <p className={`mt-3 text-sm tabular-nums ${Math.abs(sum - 100) < 1e-6 ? "text-cyan" : "text-gold"}`}>Total: {sum}% {Math.abs(sum - 100) < 1e-6 ? "✓" : "(must equal 100%)"}</p>
          <label className="mt-4 block space-y-1.5"><span className="text-xs uppercase tracking-wider text-muted-foreground">Allocation source</span><input className={field} value={data.allocationSource} placeholder="Document the basis for these shares" onChange={(e) => setData({ ...data, allocationSource: e.target.value })} /></label>
        </Panel>
      </div>
    </Shell>
  );
}
