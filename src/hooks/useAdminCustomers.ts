import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AdminCustomer {
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string | null;
  hasActiveRental: boolean;
  firstBooking: string | null;
}

export function useAdminCustomers() {
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("bookings")
        .select("customer_name, customer_email, customer_phone, total_amount, status, created_at, rental_start")
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
        toast({ title: "Error loading customers", description: err.message, variant: "destructive" });
      } else {
        setRawBookings(data ?? []);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const customers = useMemo(() => {
    const map = new Map<string, AdminCustomer>();

    for (const b of rawBookings) {
      const key = b.customer_email;
      const existing = map.get(key);
      if (existing) {
        existing.totalBookings += 1;
        existing.totalSpent += Number(b.total_amount);
        if (!existing.lastBooking || b.created_at > existing.lastBooking) {
          existing.lastBooking = b.created_at;
        }
        if (!existing.firstBooking || b.created_at < existing.firstBooking) {
          existing.firstBooking = b.created_at;
        }
        if (b.status === "confirmed" || b.status === "active" || b.status === "delivered") {
          existing.hasActiveRental = true;
        }
        // Use latest name/phone
        if (b.created_at > (existing.lastBooking ?? "")) {
          existing.customer_name = b.customer_name;
          existing.customer_phone = b.customer_phone;
        }
      } else {
        map.set(key, {
          customer_name: b.customer_name,
          customer_email: b.customer_email,
          customer_phone: b.customer_phone,
          totalBookings: 1,
          totalSpent: Number(b.total_amount),
          lastBooking: b.created_at,
          firstBooking: b.created_at,
          hasActiveRental: b.status === "confirmed" || b.status === "active" || b.status === "delivered",
        });
      }
    }

    return Array.from(map.values());
  }, [rawBookings]);

  return { customers, loading, error };
}
