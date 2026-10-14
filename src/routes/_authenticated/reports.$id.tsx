import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Shell, Panel } from "@/components/Shell";
import { Modal } from "@/components/Modal";
import { AllocationChart } from "@/components/AllocationChart";
import { useReportActions } from "@/components/ReportActions";
import { supabase } from "@/integrations/supabase/client";
import { estimate, inr, inr2 } from "@/lib/estimate";
import { useEstimate } from "@/lib/store";
import { buildReportRow, reportSnapshot, shortId } from "@/lib/reports";
import { reportQuery } from "@/lib/useReports";

export const Route = createFileRoute("/_authenticated/reports/$id")({
  head: () => ({
    meta: [
      { title: "Saved Report · CostPlan Pro" },
      { name: "description", content: "A saved Plinth Area construction cost estimate." },
      { property: "og:title", content: "Saved Report · CostPlan Pro" },
      { property: "og:description", content: "Saved construction cost estimate." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: current, setInputs } = useEstimate();
  const { data: rep, isLoading } = useQuery(reportQuery(id));
  const { actions, modals } = useReportActions(() => navigate({ to: "/reports" }));
  const [recalcOpen, setRecalcOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isLoading) return <Shell><p className="text-muted-foreground">Loading report…</p></Shell>;
  if (!rep) return <Shell><p className="mb-4">This report was not found.</p><Link to="/reports" className="btn-ghost">← Saved Reports</Link></Shell>;

  const s = reportSnapshot(rep);
  const r = s.result, i = s.inputs;
  const fresh = estimate(i, current);

  const applyRecalc = async () => {
    if (!fresh.ok) return;
    setBusy(true);
    const row = buildReportRow(i, current, fresh, { report_name: rep.report_name, project_name: rep.project_name, notes: rep.notes });
    const { error } = await supabase.from("saved_reports").update(row).eq("id", rep.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Report recalculated with current rates");
    setRecalcOpen(false);
    qc.invalidateQueries({ queryKey: ["reports"] });
  };

  return (
    <Shell>
      <Link to="/reports" className="text-sm text-cyan hover:underline">← Saved Reports</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display text-3xl">{rep.report_name}</h1><p className="text-sm text-muted-foreground">Report ID {shortId(rep.id)} · saved {new Date(rep.created_at).toLocaleString("en-IN")} · updated {new Date(rep.updated_at).toLocaleString("en-IN")}</p></div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-gold" onClick={() => actions.pdf(rep)}>Download PDF</button>
          <button className="btn-ghost" onClick={() => actions.rename(rep)}>Rename</button>
          <button className="btn-ghost" onClick={() => actions.duplicate(rep)}>Duplicate</button>
          <button className="btn-ghost" onClick={() => setRecalcOpen(true)}>Recalculate with current rates</button>
          <button className="btn-ghost" onClick={() => { setInputs(i); navigate({ to: "/" }); }}>Load into calculator</button>
          <button className="btn-ghost hover:!border-destructive hover:!text-destructive" onClick={() => actions.remove(rep)}>Delete</button>
        </div>
      </div>
      <p className="mb-4 rounded-md border border-cyan/30 bg-cyan/5 px-3 py-2 text-xs text-muted-foreground">These are the values saved with the report. Changing your rate table does not alter them unless you choose "Recalculate with current rates".</p>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Saved estimate" className="lg:col-span-2">
          <p className="font-display text-4xl text-gold tabular-nums">{inr(r.total)}</p>
          <p className="mt-2 rounded-md bg-secondary/60 p-3 font-mono text-xs text-cyan">{r.totalArea.toLocaleString("en-IN")} sq ft × {inr2(r.rate)} = {inr(r.total)}</p>
          <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {[["Project", rep.project_name || "—"], ["Building type", i.buildingType], ["Quality", i.quality], ["Location", i.location], ["City / State", [i.city, i.state].filter(Boolean).join(", ") || "—"],
              ["Area mode", i.areaMode === "perFloor" ? "Area per floor" : "Total plinth area"], ["Entered area", `${i.area.toLocaleString("en-IN")} sq ft`], ["Floors", String(i.floors)],
              ["Total plinth area", `${r.totalArea.toLocaleString("en-IN")} sq ft`], ["Rate / sq ft", inr2(r.rate)], ["Cost / sq ft", inr2(r.costPerSqFt)], ["Rate source", rep.rate_source || "—"]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-border/40 py-1"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>
            ))}
          </dl>
          {rep.notes && <p className="mt-4 whitespace-pre-wrap text-sm"><span className="text-muted-foreground">Notes: </span>{rep.notes}</p>}
        </Panel>
        <Panel title="Cost allocation">
          {r.allocations ? <AllocationChart rows={r.allocations} /> : <p className="text-sm text-muted-foreground">{r.allocationMissing}</p>}
        </Panel>
      </div>
      <Modal open={recalcOpen} onClose={() => setRecalcOpen(false)} title="Recalculate with current rates">
        {fresh.ok ? (
          <>
            <p className="text-sm text-muted-foreground">Same inputs, your current rate table:</p>
            <div className="my-4 grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Saved</span><span className="text-right tabular-nums">{inr(r.total)} @ {inr2(r.rate)}</span>
              <span className="text-muted-foreground">Current</span><span className="text-right tabular-nums text-gold">{inr(fresh.total)} @ {inr2(fresh.rate)}</span>
            </div>
            <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={() => setRecalcOpen(false)}>Keep saved values</button><button className="btn-gold" disabled={busy} onClick={applyRecalc}>Update report</button></div>
          </>
        ) : <><ul className="list-disc pl-5 text-sm">{fresh.missing.map((m) => <li key={m}>{m}</li>)}</ul><div className="mt-4 flex justify-end"><button className="btn-ghost" onClick={() => setRecalcOpen(false)}>Close</button></div></>}
      </Modal>
      {modals}
    </Shell>
  );
}
