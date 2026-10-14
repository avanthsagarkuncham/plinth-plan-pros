import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Panel, Missing } from "@/components/Shell";
import { useEstimate } from "@/lib/store";
import { SaveReportButton } from "@/components/SaveReportButton";
import { BUILDING_TYPES, LOCATIONS, QUALITIES, inr, inr2 } from "@/lib/estimate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plinth Area Construction Cost Estimator" },
      { name: "description", content: "Estimate construction cost with the Plinth Area Method: total plinth area × validated rate per sq ft." },
      { property: "og:title", content: "Plinth Area Construction Cost Estimator" },
      { property: "og:description", content: "Estimate construction cost with the Plinth Area Method." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const field = "w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/30";

export function Label({ t, children }: { t: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-xs uppercase tracking-wider text-muted-foreground">{t}</span>{children}</label>;
}

function Index() {
  const { inputs: i, setInputs, result } = useEstimate();
  return (
    <Shell>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">Plinth Area Method</p>
        <h1 className="mt-2 font-display text-3xl text-foreground sm:text-5xl">Construction Cost <span className="text-gold">Estimator</span></h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Estimated Cost = Total Plinth Area × Applicable Rate per sq ft. Rates come from your validated rate table — nothing is fabricated.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Project inputs">
          <div className="grid gap-4 sm:grid-cols-2">
            <Label t="Project name"><input className={field} value={i.projectName} onChange={(e) => setInputs({ projectName: e.target.value })} /></Label>
            <Label t="Building type"><select className={field} value={i.buildingType} onChange={(e) => setInputs({ buildingType: e.target.value as never })}>{BUILDING_TYPES.map((x) => <option key={x}>{x}</option>)}</select></Label>
            <Label t="Area measurement mode"><select className={field} value={i.areaMode} onChange={(e) => setInputs({ areaMode: e.target.value as never })}><option value="perFloor">Area per floor</option><option value="total">Total plinth area</option></select></Label>
            <Label t={i.areaMode === "perFloor" ? "Plinth area per floor (sq ft)" : "Total plinth area (sq ft)"}><input type="number" min={0} className={field} value={i.area || ""} onChange={(e) => setInputs({ area: Number(e.target.value) })} /></Label>
            <Label t="Number of floors"><input type="number" min={1} step={1} className={field} value={i.floors || ""} onChange={(e) => setInputs({ floors: Math.max(0, Math.floor(Number(e.target.value))) })} /></Label>
            <Label t="Construction quality"><select className={field} value={i.quality} onChange={(e) => setInputs({ quality: e.target.value as never })}>{QUALITIES.map((x) => <option key={x}>{x}</option>)}</select></Label>
            <Label t="Location category"><select className={field} value={i.location} onChange={(e) => setInputs({ location: e.target.value as never })}>{LOCATIONS.map((x) => <option key={x}>{x}</option>)}</select></Label>
            <Label t="State"><input className={field} value={i.state} onChange={(e) => setInputs({ state: e.target.value })} /></Label>
            <Label t="City or town"><input className={field} value={i.city} onChange={(e) => setInputs({ city: e.target.value })} /></Label>
          </div>
          {i.areaMode === "total" && <p className="mt-3 text-xs text-muted-foreground">Total plinth area is used directly; floors are recorded but not multiplied.</p>}
        </Panel>
        <Panel title="Estimate" className="lg:sticky lg:top-20 self-start">
          {result.ok ? (
            <div className="space-y-4">
              <div><p className="text-xs text-muted-foreground">Estimated construction cost</p><p className="font-display text-4xl text-gold tabular-nums">{inr(result.total)}</p></div>
              <div className="rounded-md bg-secondary/60 p-3 font-mono text-xs text-cyan">{result.totalArea.toLocaleString("en-IN")} sq ft × {inr2(result.rate)} = {inr(result.total)}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Total plinth area</p><p className="tabular-nums">{result.totalArea.toLocaleString("en-IN")} sq ft</p></div>
                <div><p className="text-muted-foreground text-xs">Cost / sq ft</p><p className="tabular-nums">{inr2(result.costPerSqFt)}</p></div>
              </div>
              <div className="flex flex-wrap gap-2"><Link to="/dashboard" className="btn-gold">Dashboard</Link><Link to="/breakdown" className="btn-ghost">Breakdown</Link><SaveReportButton /></div>
            </div>
          ) : <Missing items={result.missing} />}
        </Panel>
      </div>
    </Shell>
  );
}
