import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    // TODO: Once user_roles table + has_role() function are created via migration,
    // replace this with: supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
    const checkAdmin = async () => {
      // For now, allow all authenticated users during development
      setIsAdmin(true);
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
