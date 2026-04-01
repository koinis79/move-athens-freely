import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  /** Check admin role via RPC, then mark loading as done. */
  const checkAdmin = async (s: Session | null) => {
    if (!s) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) {
        console.error("[Auth] Failed to check admin status:", error);
        setIsAdmin(false);
      } else {
        console.log("[Auth] is_admin =", data, "for user", s.user.email);
        setIsAdmin(!!data);
      }
    } catch (err) {
      console.error("[Auth] Admin check threw:", err);
      setIsAdmin(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    // 1. Get the initial session, check admin, THEN set loading=false
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      checkAdmin(s);
    });

    // 2. Listen for future auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // Re-check admin on every auth change
      setLoading(true);
      checkAdmin(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, isAdmin, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
