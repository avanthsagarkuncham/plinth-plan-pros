import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { fieldCls } from "@/components/Modal";
import { useReportActions } from "@/components/ReportActions";
import { BUILDING_TYPES, LOCATIONS, inr, inr2 } from "@/lib/estimate";
import { reportsQuery } from "@/lib/useReports";
import { shortId } from "@/lib/reports";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Saved Reports · CostPlan Pro" },
      { name: "description", content: "Your saved Plinth Area construction cost estimates." },
      { property: "og:title", content: "Saved Reports · CostPlan Pro" },
      { property: "og:description", content: "Open, rename, duplicate and download your saved estimates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsLayout,
});

function ReportsLayout() {
  const child = useMatch({ from: "/_authenticated/reports/$id", shouldThrow: false });
  return child ? <Outlet /> : <ReportsList />;
}

const DAY = 86400000;
const dateStr = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

function ReportsList() {
  const { data = [], isLoading, error } = useQuery(reportsQuery);
  const { actions, modals } = useReportActions();
  const [q, setQ] = useState(""); const [type, setType] = useState(""); const [loc, setLoc] = useState("");
  const [age, setAge] = useState("0"); const [sort, setSort] = useState("new");
  const list = useMemo(() => {
    const now = Date.now(), t = q.trim().toLowerCase();
    return data.filter((r) =>
      (!t || [r.report_name, r.project_name, r.city, r.state, r.id].some((x) => x.toLowerCase().includes(t))) &&
      (!type || r.building_type === type) && (!loc || r.location_category === loc) &&
      (age === "0" || now - new Date(r.created_at).getTime() <= Number(age) * DAY),
    ).sort((a, b) => sort === "new" ? b.created_at.localeCompare(a.created_at) : sort === "old" ? a.created_at.localeCompare(b.created_at)
      : sort === "high" ? Number(b.estimated_total_cost) - Number(a.estimated_total_cost) : Number(a.estimated_total_cost) - Number(b.estimated_total_cost));
  }, [data, q, type, loc, age, sort]);

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Saved Reports</h1>
        <Link to="/" className="btn-gold">Create New Estimate</Link>
      </div>
      <div className="panel mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input className={fieldCls + " lg:col-span-1"} placeholder="Search name, project, city…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search reports" />
        <select className={fieldCls} value={type} onChange={(e) => setType(e.target.value)} aria-label="Building type"><option value="">All building types</option>{BUILDING_TYPES.map((x) => <option key={x}>{x}</option>)}</select>
        <select className={fieldCls} value={loc} onChange={(e) => setLoc(e.target.value)} aria-label="Location"><option value="">All locations</option>{LOCATIONS.map((x) => <option key={x}>{x}</option>)}</select>
        <select className={fieldCls} value={age} onChange={(e) => setAge(e.target.value)} aria-label="Date created"><option value="0">Any date</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="365">Last 12 months</option></select>
        <select className={fieldCls} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="new">Newest first</option><option value="old">Oldest first</option><option value="high">Highest estimated cost</option><option value="low">Lowest estimated cost</option></select>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading reports…</p> : error ? <p className="text-destructive">Could not load reports: {(error as Error).message}</p> : data.length === 0 ? (
        <div className="panel py-12 text-center">
          <p className="mb-4 text-muted-foreground">No saved reports yet. Create your first construction estimate.</p>
          <Link to="/" className="btn-gold">Create New Estimate</Link>
        </div>
      ) : list.length === 0 ? <p className="text-muted-foreground">No reports match these filters.</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((r) => {
            const area = Number(r.total_plinth_area), total = Number(r.estimated_total_cost);
            return (
              <article key={r.id} className="panel flex flex-col">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0"><h2 className="truncate font-display text-xl text-gold">{r.report_name}</h2><p className="text-xs text-muted-foreground">ID {shortId(r.id)}{r.project_name ? ` · ${r.project_name}` : ""}</p></div>
                  <p className="shrink-0 font-display text-xl tabular-nums">{inr(total)}</p>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {[["Building", r.building_type], ["Quality", r.construction_quality], ["Location", r.location_category], ["City / State", [r.city, r.state].filter(Boolean).join(", ") || "—"],
                    ["Plinth area", `${area.toLocaleString("en-IN")} sq ft`], ["Floors", String(r.floors)], ["Rate / sq ft", inr2(Number(r.rate_per_sqft))], ["Cost / sq ft", inr2(total / area)],
                    ["Created", dateStr(r.created_at)], ["Updated", dateStr(r.updated_at)]].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2 border-b border-border/40 py-1"><dt className="text-muted-foreground">{k}</dt><dd className="truncate text-right">{v}</dd></div>
                  ))}
                </dl>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <Link to="/reports/$id" params={{ id: r.id }} className="btn-gold !py-1">Open</Link>
                  <button className="btn-ghost !py-1" onClick={() => actions.rename(r)}>Rename</button>
                  <button className="btn-ghost !py-1" onClick={() => actions.pdf(r)}>PDF</button>
                  <button className="btn-ghost !py-1" onClick={() => actions.duplicate(r)}>Duplicate</button>
                  <button className="btn-ghost !py-1 hover:!border-destructive hover:!text-destructive" onClick={() => actions.remove(r)}>Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {modals}
    </Shell>
  );
}
