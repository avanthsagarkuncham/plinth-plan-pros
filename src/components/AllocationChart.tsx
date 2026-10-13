import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { inr } from "@/lib/estimate";

const colors = ["var(--gold)", "var(--cyan)", "var(--chart-3)", "var(--chart-4)"];

export function AllocationChart({ rows }: { rows: { category: string; amount: number; percent: number }[] }) {
  return (
    <div>
      <div className="h-56">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={rows} dataKey="amount" nameKey="category" innerRadius="55%" outerRadius="85%" stroke="var(--background)" isAnimationActive={typeof window !== "undefined" && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches}>
              {rows.map((_, i) => <Cell key={i} fill={colors[i]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {rows.map((r, i) => (
          <li key={r.category} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i] }} />{r.category}</span>
            <span className="tabular-nums text-muted-foreground">{r.percent}% · {inr(r.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
