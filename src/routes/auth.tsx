import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth";

const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/dashboard");

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : undefined }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: safePath(search.redirect) });
  },
  head: () => ({
    meta: [
      { title: "Sign in · CostPlan Pro" },
      { name: "description", content: "Sign in or create a CostPlan Pro account to save Plinth Area construction estimates." },
      { property: "og:title", content: "Sign in · CostPlan Pro" },
      { property: "og:description", content: "Build smarter. Estimate better." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const field = "w-full rounded-lg border border-input bg-background/40 px-3 py-2.5 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/30";
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function Blueprint() {
  return (
    <svg viewBox="0 0 320 200" className="auth-draw w-full max-w-md" fill="none" aria-hidden>
      <g stroke="var(--cyan)" strokeWidth="1.2" opacity=".8">
        <path d="M20 180 H300" /><path d="M50 180 V90 L160 30 L270 90 V180" /><path d="M50 90 H270" />
        <rect x="80" y="110" width="40" height="40" /><rect x="200" y="110" width="40" height="40" /><rect x="140" y="120" width="40" height="60" />
        <path d="M100 110 V150 M80 130 H120 M220 110 V150 M200 130 H240" opacity=".6" />
      </g>
      <g stroke="var(--gold)" strokeWidth="1" strokeDasharray="4 4" opacity=".9">
        <path d="M50 192 H270" /><path d="M50 188 V196 M270 188 V196" /><path d="M285 30 V180" /><path d="M281 30 H289 M281 180 H289" />
      </g>
    </svg>
  );
}

function AuthPage() {
  const { redirect: back } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const switchTab = (t: typeof tab) => { setTab(t); setErr(""); setInfo(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setInfo("");
    if (!emailOk(email)) return setErr("Please enter a valid email address.");
    if (tab !== "forgot" && pw.length < 8) return setErr("Password must be at least 8 characters.");
    if (tab === "signup" && pw !== pw2) return setErr("Passwords do not match.");
    setBusy(true);
    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        if (remember) localStorage.removeItem("cp.noremember"); else localStorage.setItem("cp.noremember", "1");
        sessionStorage.setItem("cp.alive", "1");
        navigate({ to: safePath(back), replace: true });
      } else if (tab === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin + "/dashboard" } });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard", replace: true });
        else { setInfo("Account created. Check your email and click the confirmation link, then sign in."); setTab("login"); setPw(""); setPw2(""); }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error;
        setInfo("If an account exists for this email, a password reset link is on its way.");
      }
    } catch (e) {
      setErr(friendlyAuthError((e as Error).message));
    } finally { setBusy(false); }
  };

  return (
    <div className="blueprint min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
        <section className="hidden animate-rise lg:block">
          <Link to="/" className="font-display text-xl tracking-wide text-gold">COSTPLAN<span className="text-cyan">·</span>PRO</Link>
          <h1 className="mt-6 font-display text-5xl leading-tight">Build Smarter.<br /><span className="text-gold">Estimate Better.</span></h1>
          <p className="mt-4 max-w-md text-muted-foreground">Intelligent construction cost estimation using the Plinth Area Method.</p>
          <div className="my-8"><Blueprint /></div>
          <ul className="space-y-3">
            {[["Smart Cost Estimation", "Total plinth area × applicable rate, instantly."], ["Location-Based Rates", "Rates by building type, quality and location."], ["Secure Saved Reports", "Your reports are private to your account."]].map(([t, d], n) => (
              <li key={t} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/50 text-xs text-gold">{n + 1}</span><div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div></li>
            ))}
          </ul>
        </section>

        <section className="glass-card mx-auto w-full max-w-md animate-rise">
          <Link to="/" className="mb-4 block text-center font-display text-xl text-gold lg:hidden">COSTPLAN<span className="text-cyan">·</span>PRO</Link>
          {tab !== "forgot" ? (
            <div className="mb-6 grid grid-cols-2 rounded-lg bg-secondary/60 p-1 text-sm" role="tablist">
              {(["login", "signup"] as const).map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => switchTab(t)} className={`rounded-md py-2 transition ${tab === t ? "bg-background text-gold shadow" : "text-muted-foreground hover:text-foreground"}`}>{t === "login" ? "Login" : "Create Account"}</button>
              ))}
            </div>
          ) : <h2 className="mb-2 font-display text-2xl">Reset password</h2>}
          {tab === "forgot" && <p className="mb-4 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>}

          <form onSubmit={submit} className="space-y-4" noValidate>
            <label className="block space-y-1.5"><span className="text-xs uppercase tracking-wider text-muted-foreground">Email</span>
              <input type="email" autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            {tab !== "forgot" && (
              <label className="block space-y-1.5"><span className="text-xs uppercase tracking-wider text-muted-foreground">Password</span>
                <div className="relative">
                  <input type={show ? "text" : "password"} autoComplete={tab === "login" ? "current-password" : "new-password"} className={field + " pr-16"} value={pw} onChange={(e) => setPw(e.target.value)} />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-cyan hover:bg-secondary" aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button>
                </div></label>
            )}
            {tab === "signup" && (
              <label className="block space-y-1.5"><span className="text-xs uppercase tracking-wider text-muted-foreground">Confirm password</span>
                <input type={show ? "text" : "password"} autoComplete="new-password" className={field} value={pw2} onChange={(e) => setPw2(e.target.value)} /></label>
            )}
            {tab === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[var(--gold)]" />Remember me</label>
                <button type="button" onClick={() => switchTab("forgot")} className="text-cyan hover:underline">Forgot password?</button>
              </div>
            )}
            {err && <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
            {info && <p role="status" className="rounded-md border border-cyan/40 bg-cyan/10 px-3 py-2 text-sm text-cyan">{info}</p>}
            <button type="submit" disabled={busy} className="btn-gold w-full justify-center !py-2.5 disabled:opacity-60">
              {busy && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              {tab === "login" ? "Sign In" : tab === "signup" ? "Create Account" : "Send reset link"}
            </button>
            {tab === "forgot" && <button type="button" onClick={() => switchTab("login")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">← Back to sign in</button>}
          </form>
        </section>
      </div>
    </div>
  );
}
