CREATE TABLE public.saved_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  report_name text NOT NULL,
  project_name text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  building_type text NOT NULL,
  construction_quality text NOT NULL,
  location_category text NOT NULL,
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  area_mode text NOT NULL,
  area_per_floor numeric,
  total_plinth_area numeric NOT NULL,
  floors integer NOT NULL DEFAULT 1,
  rate_per_sqft numeric NOT NULL,
  estimated_total_cost numeric NOT NULL,
  cost_allocations jsonb,
  estimate_inputs jsonb NOT NULL,
  assumptions jsonb,
  rate_source text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_reports TO authenticated;
GRANT ALL ON public.saved_reports TO service_role;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.saved_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.saved_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.saved_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.saved_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX saved_reports_user_idx ON public.saved_reports(user_id, created_at DESC);
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER saved_reports_touch BEFORE UPDATE ON public.saved_reports FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();