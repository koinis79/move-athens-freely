import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DeliveryZone {
  id: string;
  name_en: string;
  slug: string;
  delivery_fee: number;
}

/**
 * Single source of truth for delivery zones on the customer-facing site.
 * Fetches ACTIVE zones ordered by sort_order — the same query BookingPanel
 * and NewBookingModal use — so checkout, the product panel, and the How It
 * Works page can never drift from the delivery_zones table (see lesson 18).
 */
export function useDeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("delivery_zones")
      .select("id, name_en, slug, delivery_fee")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (cancelled) return;
        if (data) setZones(data as DeliveryZone[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { zones, loading };
}
