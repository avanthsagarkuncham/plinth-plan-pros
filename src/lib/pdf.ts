import type { Estimate, Inputs, RateData } from "./estimate";
import { ASSUMPTIONS, EXCLUSIONS } from "./reports";

// jsPDF's built-in fonts have no ₹ glyph, so "Rs." is used with Indian digit grouping (12,34,567).
const rs = (n: number) => "Rs. " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export interface ReportMeta { id?: string; name?: string; notes?: string; createdAt?: string; assumptions?: string[]; exclusions?: string[] }

export async function downloadReport(i: Inputs, d: RateData, e: Extract<Estimate, { ok: true }>, meta: ReportMeta = {}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210; let y = 0;
  doc.setFillColor(14, 27, 56); doc.rect(0, 0, W, 40, "F");
  doc.setTextColor(212, 175, 85); doc.setFontSize(9); doc.text("COSTPLAN PRO", 15, 10);
  doc.setFontSize(18); doc.text(meta.name || "Plinth Area Cost Estimate", 15, 20);
  doc.setTextColor(200, 220, 240); doc.setFontSize(10);
  doc.text(`${i.projectName || "Untitled project"}  ·  Generated ${new Date().toLocaleDateString("en-IN")}`, 15, 28);
  if (meta.id) doc.text(`Report ID: ${meta.id}${meta.createdAt ? `  ·  Saved ${new Date(meta.createdAt).toLocaleDateString("en-IN")}` : ""}`, 15, 34);
  y = 50; doc.setTextColor(20, 30, 50);
  const section = (t: string) => { if (y > 265) { doc.addPage(); y = 20; } doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text(t, 15, y); doc.setDrawColor(40, 170, 200); doc.line(15, y + 1.5, 195, y + 1.5); y += 8; doc.setFont("helvetica", "normal"); doc.setFontSize(10); };
  const row = (k: string, v: string) => { if (y > 280) { doc.addPage(); y = 20; } doc.text(k, 18, y); doc.text(v, 192, y, { align: "right" }); y += 6; };
  const para = (t: string) => { const l = doc.splitTextToSize(t, 175); if (y + l.length * 5 > 285) { doc.addPage(); y = 20; } doc.text(l, 18, y); y += l.length * 5 + 1; };

  section("Project & building details");
  row("Project name", i.projectName || "-");
  row("Building type", i.buildingType); row("Construction quality", i.quality);
  row("Area mode", i.areaMode === "perFloor" ? "Area per floor" : "Total plinth area");
  row("Entered area", `${i.area.toLocaleString("en-IN")} sq ft`);
  row("Number of floors", String(i.floors));
  y += 3; section("Location details");
  row("Location category", i.location); row("State / City", `${i.state || "-"} / ${i.city || "-"}`);
  y += 3; section("Estimate (Plinth Area Method)");
  row("Total plinth area", `${e.totalArea.toLocaleString("en-IN")} sq ft`);
  row("Applicable rate", `${rs(e.rate)} / sq ft`);
  row("Estimated total construction cost", rs(e.total));
  row("Estimated cost per sq ft", rs(Number(e.costPerSqFt.toFixed(2))));
  y += 2; para(`Formula: Estimated Cost = Total Plinth Area x Rate = ${e.totalArea.toLocaleString("en-IN")} x ${rs(e.rate)} = ${rs(e.total)}`);
  para(`Rate source: ${d.source || "Not specified"}`);
  y += 3; section("Cost allocations");
  if (e.allocations) {
    e.allocations.forEach((a) => row(`${a.category} (${a.percent}%)`, rs(a.amount)));
    doc.setFont("helvetica", "bold"); row("Total", rs(e.allocations.reduce((s, a) => s + a.amount, 0))); doc.setFont("helvetica", "normal");
    if (d.allocationSource) para(`Allocation source: ${d.allocationSource}`);
  } else para(e.allocationMissing ?? "Not provided.");
  if (meta.notes) { y += 3; section("Notes"); para(meta.notes); }
  y += 3; section("Assumptions");
  (meta.assumptions ?? ASSUMPTIONS).forEach((t) => para("• " + t));
  y += 2; section("Exclusions");
  (meta.exclusions ?? EXCLUSIONS).forEach((t) => para("• " + t));
  y += 4; doc.setFont("helvetica", "bold");
  para("This document is a preliminary cost estimate only. It is not a certified construction quotation.");
  doc.save(`costplan-${(meta.name || i.projectName || "estimate").replace(/\W+/g, "-")}.pdf`);
}
