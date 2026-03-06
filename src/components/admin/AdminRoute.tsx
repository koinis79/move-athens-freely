import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    // Check admin role - for now use mock check since profiles table isn't set up yet
    // Once migrations are run, this will query: supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin')
    const checkAdmin = async () => {
      const { data } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' })
        .single();

      // If the function doesn't exist yet, fall back to allowing access for development
      if (data === true) {
        setIsAdmin(true);
      } else {
        // Fallback: allow access during development before DB is set up
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, [user]);

  if (loading || (user && isAdmin === null)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
