import { createFileRoute } from "@tanstack/react-router";
import { Shell, Panel, Missing } from "@/components/Shell";
import { AllocationChart } from "@/components/AllocationChart";
import { useEstimate } from "@/lib/store";
import { inr } from "@/lib/estimate";

export const Route = createFileRoute("/breakdown")({
  head: () => ({
    meta: [
      { title: "Cost Breakdown · Plinth Area Cost" },
      { name: "description", content: "Allocation of the estimated cost across materials, labour, equipment and other expenses." },
      { property: "og:title", content: "Cost Breakdown · Plinth Area Cost" },
      { property: "og:description", content: "Cost allocations that add up exactly to the estimate." },
    ],
  }),
  component: Breakdown,
});

function Breakdown() {
  const { data, result: r } = useEstimate();
  return (
    <Shell>
      <h1 className="mb-2 font-display text-3xl">Cost Breakdown</h1>
      <p className="mb-6 text-sm text-muted-foreground">Proportional allocations of the total estimate — not material quantity calculations.</p>
      {!r.ok ? <Missing items={r.missing} /> : !r.allocations ? <Missing items={[r.allocationMissing!]} /> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Allocations">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase text-muted-foreground"><th className="pb-2">Category</th><th className="pb-2 text-right">Share</th><th className="pb-2 text-right">Amount</th></tr></thead>
              <tbody>
                {r.allocations.map((a) => <tr key={a.category} className="border-t border-border/60"><td className="py-2.5">{a.category}</td><td className="text-right tabular-nums">{a.percent}%</td><td className="text-right tabular-nums">{inr(a.amount)}</td></tr>)}
                <tr className="border-t-2 border-gold/50 font-semibold"><td className="py-3">Grand total</td><td className="text-right">100%</td><td className="text-right tabular-nums text-gold">{inr(r.allocations.reduce((s, a) => s + a.amount, 0))}</td></tr>
              </tbody>
            </table>
            {data.allocationSource && <p className="mt-4 text-xs text-muted-foreground">Source: {data.allocationSource}</p>}
          </Panel>
          <Panel title="Chart"><AllocationChart rows={r.allocations} /></Panel>
        </div>
      )}
    </Shell>
  );
}
