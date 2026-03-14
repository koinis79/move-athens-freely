import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  activeRentals: number;
  todaysDeliveries: number;
  pendingRequests: number;
  todaysRevenue: number;
  upcomingPickups: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("admin_dashboard_stats")
        .select("*")
        .maybeSingle();

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      setStats({
        activeRentals: data?.active_rentals ?? 0,
        todaysDeliveries: data?.todays_deliveries ?? 0,
        pendingRequests: data?.pending_requests ?? 0,
        todaysRevenue: data?.todays_revenue ?? 0,
        upcomingPickups: data?.upcoming_pickups ?? 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
