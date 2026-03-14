import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AdminBooking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string | null;
  delivery_time_slot: string | null;
  delivery_notes: string | null;
  special_requirements: string | null;
  rental_start: string;
  rental_end: string;
  num_days: number;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  status: string;
  payment_status: string;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  booking_items: {
    id: string;
    quantity: number;
    price_per_day: number;
    num_days: number;
    subtotal: number;
    equipment: {
      id: string;
      name_en: string;
      slug: string;
      images: string[];
      category_id: string;
    } | null;
  }[];
}

interface Filters {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function useAdminBookings(filters?: Filters) {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("bookings")
      .select(`
        *,
        booking_items(*, equipment(id, name_en, slug, images, category_id))
      `)
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters?.dateFrom) {
      query = query.gte("rental_start", filters.dateFrom.toISOString().split("T")[0]);
    }
    if (filters?.dateTo) {
      query = query.lte("rental_start", filters.dateTo.toISOString().split("T")[0]);
    }
    if (filters?.search) {
      const q = filters.search.trim();
      query = query.or(`booking_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%`);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
      toast({ title: "Error loading bookings", description: err.message, variant: "destructive" });
    } else {
      setBookings((data as AdminBooking[]) ?? []);
    }
    setLoading(false);
  }, [filters?.search, filters?.status, filters?.dateFrom?.getTime(), filters?.dateTo?.getTime()]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const { error: err } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (err) {
      toast({ title: "Error updating status", description: err.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Status updated", description: `Booking status changed to ${newStatus}` });
    await fetchBookings();
    return true;
  };

  return { bookings, loading, error, refetch: fetchBookings, updateBookingStatus };
}
