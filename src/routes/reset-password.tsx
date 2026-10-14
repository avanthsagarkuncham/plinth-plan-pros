import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password · CostPlan Pro" },
      { name: "description", content: "Choose a new password for your CostPlan Pro account." },
      { property: "og:title", content: "Set a new password · CostPlan Pro" },
      { property: "og:description", content: "Reset your CostPlan Pro password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reset,
});

const field = "w-full rounded-lg border border-input bg-background/40 px-3 py-2.5 text-sm outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/30";

function Reset() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data: sub } = supabase.auth.onAuthStateChange((ev) => { if (ev === "PASSWORD_RECOVERY") setReady(true); });
    supabase.auth.getSession().then(({ data }) => { if (data.session && (isRecovery || data.session)) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (pw.length < 8) return setErr("Password must be at least 8 characters.");
    if (pw !== pw2) return setErr("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setErr(friendlyAuthError(error.message));
    setDone(true); setTimeout(() => navigate({ to: "/dashboard", replace: true }), 1500);
  };
  return (
    <div className="blueprint flex min-h-screen items-center justify-center px-4">
      <section className="glass-card w-full max-w-md animate-rise">
        <h1 className="mb-4 font-display text-3xl text-gold">Set a new password</h1>
        {done ? <p className="text-cyan">Password updated. Taking you to your dashboard…</p> : !ready ? (
          <p className="text-sm text-muted-foreground">Open this page from the reset link in your email. If the link expired, request a new one from the sign-in page.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input type="password" placeholder="New password" autoComplete="new-password" className={field} value={pw} onChange={(e) => setPw(e.target.value)} />
            <input type="password" placeholder="Confirm new password" autoComplete="new-password" className={field} value={pw2} onChange={(e) => setPw2(e.target.value)} />
            {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
            <button className="btn-gold w-full justify-center" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
          </form>
        )}
      </section>
    </div>
  );
}
