import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Report } from "./reports";

// RLS restricts rows to the signed-in user; no client-side ownership filtering is relied upon.
export const reportsQuery = queryOptions({
  queryKey: ["reports"],
  queryFn: async (): Promise<Report[]> => {
    const { data, error } = await supabase.from("saved_reports").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const reportQuery = (id: string) => queryOptions({
  queryKey: ["reports", id],
  queryFn: async (): Promise<Report | null> => {
    const { data, error } = await supabase.from("saved_reports").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export async function duplicateReport(r: Report) {
  const { id: _i, user_id: _u, created_at: _c, updated_at: _up, ...rest } = r;
  const { error } = await supabase.from("saved_reports").insert({ ...rest, report_name: `${r.report_name} (copy)` });
  if (error) throw error;
}
export async function renameReport(id: string, name: string) {
  const { error } = await supabase.from("saved_reports").update({ report_name: name }).eq("id", id);
  if (error) throw error;
}
export async function deleteReport(id: string) {
  const { error } = await supabase.from("saved_reports").delete().eq("id", id);
  if (error) throw error;
}
