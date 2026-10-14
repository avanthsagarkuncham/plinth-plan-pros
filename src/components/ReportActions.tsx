import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal, fieldCls } from "./Modal";
import type { Report } from "@/lib/reports";
import { reportSnapshot } from "@/lib/reports";
import { downloadReport } from "@/lib/pdf";
import { deleteReport, duplicateReport, renameReport } from "@/lib/useReports";

export function pdfForReport(r: Report) {
  const s = reportSnapshot(r);
  return downloadReport(s.inputs, s.data, s.result, { id: r.id, name: r.report_name, notes: r.notes, createdAt: r.created_at, assumptions: s.assumptions.items, exclusions: s.assumptions.exclusions });
}

export function useReportActions(onDeleted?: () => void) {
  const qc = useQueryClient();
  const [renaming, setRenaming] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState<Report | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["reports"] });
  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try { await fn(); toast.success(ok); await refresh(); return true; }
    catch (e) { toast.error((e as Error).message); return false; }
    finally { setBusy(false); }
  };
  const actions = {
    rename: (r: Report) => { setName(r.report_name); setRenaming(r); },
    remove: (r: Report) => setDeleting(r),
    duplicate: (r: Report) => run(() => duplicateReport(r), "Report duplicated"),
    pdf: (r: Report) => pdfForReport(r),
  };
  const modals = (
    <>
      <Modal open={!!renaming} onClose={() => setRenaming(null)} title="Edit report name">
        <form onSubmit={async (e) => { e.preventDefault(); if (!name.trim() || !renaming) return; if (await run(() => renameReport(renaming.id, name.trim()), "Report renamed")) setRenaming(null); }} className="space-y-4">
          <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoFocus />
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setRenaming(null)}>Cancel</button><button className="btn-gold" disabled={busy}>Save</button></div>
        </form>
      </Modal>
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete report?">
        <p className="text-sm text-muted-foreground">"{deleting?.report_name}" will be permanently deleted. This cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
          <button className="btn-ghost !border-destructive !text-destructive" disabled={busy} onClick={async () => { if (deleting && await run(() => deleteReport(deleting.id), "Report deleted")) { setDeleting(null); onDeleted?.(); } }}>Delete permanently</button>
        </div>
      </Modal>
    </>
  );
  return { actions, modals };
}
