import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const C = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      // "Remember me" off: end the session when the browser session ends.
      if (localStorage.getItem("cp.noremember") === "1" && !sessionStorage.getItem("cp.alive")) {
        localStorage.removeItem("cp.noremember");
        await supabase.auth.signOut();
      }
      sessionStorage.setItem("cp.alive", "1");
      const { data } = await supabase.auth.getSession();
      if (active) { setUser(data.session?.user ?? null); setReady(true); }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") qc.invalidateQueries();
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [router, qc]);
  return <C.Provider value={{ user, ready }}>{children}</C.Provider>;
}

export const useAuth = () => useContext(C);

export function useSignOut() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: {}, replace: true });
  };
}

export function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email or password is incorrect.";
  if (m.includes("not confirmed")) return "Please confirm your email first — check your inbox for the link.";
  if (m.includes("already registered") || m.includes("already exists")) return "An account with this email already exists. Try signing in.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("weak") || m.includes("pwned")) return "This password is too weak or has appeared in a data leak. Choose a stronger one.";
  if (m.includes("network") || m.includes("fetch")) return "Network problem — check your connection and try again.";
  return msg;
}
