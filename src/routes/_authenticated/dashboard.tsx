import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { reportsQuery } from "@/lib/useReports";
import { SaveReportButton } from "@/components/SaveReportButton";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
        <div className="flex flex-wrap gap-2">
          <Link to="/" className="btn-ghost">Create Estimate</Link>
          <Link to="/reports" className="btn-ghost">View Saved Reports</Link>
          <SaveReportButton />
          {r.ok && <button className="btn-gold" onClick={() => downloadReport(i, data, r)}>Download PDF report</button>}
        </div>
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
      <SavedStats />
    </Shell>
  );
}

function SavedStats() {
  const { data: reps = [], isLoading } = useQuery(reportsQuery);
  if (isLoading) return null;
  const latest = reps[0];
  const top = reps.reduce<(typeof reps)[number] | undefined>((m, x) => (!m || Number(x.estimated_total_cost) > Number(m.estimated_total_cost) ? x : m), undefined);
  return (
    <div className="mt-8">
      <h2 className="mb-4 font-display text-2xl">Your saved reports</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat k="Total saved reports" v={String(reps.length)} />
        <Stat k="Most recent estimate" v={latest ? inr(Number(latest.estimated_total_cost)) : "—"} />
        <Stat k="Highest project cost" v={top ? inr(Number(top.estimated_total_cost)) : "—"} accent />
      </div>
      <Panel title="Recently saved" className="mt-4">
        {reps.length === 0 ? <p className="text-sm text-muted-foreground">No saved reports yet. Create your first construction estimate.</p> : (
          <ul className="divide-y divide-border/40">
            {reps.slice(0, 5).map((x) => (
              <li key={x.id}><Link to="/reports/$id" params={{ id: x.id }} className="flex justify-between gap-3 py-2 text-sm hover:text-gold">
                <span className="truncate">{x.report_name} <span className="text-muted-foreground">· {x.building_type} · {new Date(x.created_at).toLocaleDateString("en-IN")}</span></span>
                <span className="tabular-nums">{inr(Number(x.estimated_total_cost))}</span>
              </Link></li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
