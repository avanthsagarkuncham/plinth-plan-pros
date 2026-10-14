import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth, useSignOut } from "@/lib/auth";

const nav = [
  { to: "/", label: "Estimator" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/breakdown", label: "Breakdown" },
  { to: "/reports", label: "Saved Reports" },
  { to: "/rates", label: "Rates" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const signOut = useSignOut();
  return (
    <div className="blueprint min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-lg tracking-wide text-gold">COSTPLAN<span className="text-cyan">·</span>PRO</Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "bg-secondary text-gold" }}>{n.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-sm">
            {ready && (user ? (
              <>
                <span className="max-w-[180px] truncate text-muted-foreground" title={user.email}>{user.email}</span>
                <button onClick={signOut} className="btn-ghost !py-1">Sign out</button>
              </>
            ) : <Link to="/auth" search={{}} className="btn-gold !py-1">Sign in</Link>)}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 animate-rise">{children}</main>
      <footer className="py-8 text-center text-xs text-muted-foreground">CostPlan Pro · Plinth Area cost calculator · estimates only, not certified quotations</footer>
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      {title && <h2 className="mb-4 font-display text-sm uppercase tracking-[0.2em] text-cyan">{title}</h2>}
      {children}
    </section>
  );
}

export function Missing({ items }: { items: string[] }) {
  return (
    <div className="rounded-lg border border-gold/40 bg-gold/10 p-4 text-sm">
      <p className="mb-2 font-semibold text-gold">Estimate unavailable — data needed:</p>
      <ul className="list-disc space-y-1 pl-5 text-foreground/90">{items.map((m) => <li key={m}>{m}</li>)}</ul>
      <Link to="/rates" className="mt-3 inline-block text-cyan underline">Enter validated rates →</Link>
    </div>
  );
}
