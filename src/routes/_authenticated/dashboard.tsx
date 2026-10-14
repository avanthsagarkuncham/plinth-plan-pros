import { createFileRoute } from "@tanstack/react-router";
import { Shell, Panel, Missing } from "@/components/Shell";
import { AllocationChart } from "@/components/AllocationChart";
import { useEstimate } from "@/lib/store";
import { inr, inr2 } from "@/lib/estimate";
import { downloadReport } from "@/lib/pdf";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Estimate Dashboard · Plinth Area Cost" },
      { name: "description", content: "Total plinth area, applicable rate, total cost, cost per sq ft and allocation chart." },
      { property: "og:title", content: "Estimate Dashboard · Plinth Area Cost" },
      { property: "og:description", content: "Your construction cost estimate at a glance." },
    ],
  }),
  component: Dashboard,
});

function Stat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return <div className="panel"><p className="text-xs uppercase tracking-wider text-muted-foreground">{k}</p><p className={`mt-2 font-display text-2xl tabular-nums ${accent ? "text-gold" : ""}`}>{v}</p></div>;
}

function Dashboard() {
  const { inputs: i, data, result: r } = useEstimate();
  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Dashboard</h1>
        {r.ok && <button className="btn-gold" onClick={() => downloadReport(i, data, r)}>Download PDF report</button>}
      </div>
      {!r.ok ? <Missing items={r.missing} /> : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            <Stat k="Estimated total cost" v={inr(r.total)} accent />
            <Stat k="Total plinth area" v={`${r.totalArea.toLocaleString("en-IN")} sq ft`} />
            <Stat k="Applicable rate / sq ft" v={inr2(r.rate)} />
            <Stat k="Estimated cost / sq ft" v={inr2(r.costPerSqFt)} />
            <Stat k="Construction quality" v={i.quality} />
            <Stat k="Location" v={`${i.location}${i.city ? ` · ${i.city}` : ""}${i.state ? `, ${i.state}` : ""}`} />
          </div>
          <Panel title="Cost allocation">
            {r.allocations ? <AllocationChart rows={r.allocations} /> : <Missing items={[r.allocationMissing!]} />}
          </Panel>
        </div>
      )}
    </Shell>
  );
}
