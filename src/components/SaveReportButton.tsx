import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useEstimate } from "@/lib/store";
import { buildReportRow, defaultReportName } from "@/lib/reports";
import { Modal, fieldCls } from "./Modal";

export function SaveReportButton() {
  const { user } = useAuth();
  const { inputs, data, result } = useEstimate();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  if (!result.ok) return null;
  if (!user) return <Link to="/auth" search={{ redirect: "/" }} className="btn-ghost">Sign in to save</Link>;

  const openModal = () => { setName(defaultReportName()); setProject(inputs.projectName); setNotes(""); setOpen(true); };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter a report name."); return; }
    setBusy(true);
    const { data: row, error } = await supabase.from("saved_reports")
      .insert(buildReportRow(inputs, data, result, { report_name: name.trim(), project_name: project.trim(), notes: notes.trim() }))
      .select("id").single();
    setBusy(false);
    if (error) { toast.error("Could not save the report: " + error.message); return; }
    qc.invalidateQueries({ queryKey: ["reports"] });
    setOpen(false);
    toast.success("Report saved", { action: { label: "Open", onClick: () => navigate({ to: "/reports/$id", params: { id: row.id } }) } });
  };

  return (
    <>
      <button className="btn-ghost" onClick={openModal}>Save Report</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Save report">
        <form onSubmit={save} className="space-y-3">
          <label className="block space-y-1"><span className="text-xs uppercase tracking-wider text-muted-foreground">Report name</span><input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required /></label>
          <label className="block space-y-1"><span className="text-xs uppercase tracking-wider text-muted-foreground">Project name</span><input className={fieldCls} value={project} onChange={(e) => setProject(e.target.value)} maxLength={120} /></label>
          <label className="block space-y-1"><span className="text-xs uppercase tracking-wider text-muted-foreground">Notes (optional)</span><textarea className={fieldCls} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} /></label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-gold" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
