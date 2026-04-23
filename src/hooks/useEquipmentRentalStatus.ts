import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RentalAllocation {
  equipment_id: string;
  quantity: number;
  booking_number: string;
  customer_name: string;
  customer_phone: string | null;
  rental_start: string;
  rental_end: string;
  status: string;
}

export interface RentalStatus {
  currentlyRented: number;      // units currently out
  nextReturnDate: string | null; // earliest rental_end of currently rented
  currentRentals: RentalAllocation[];
  upcomingRentals: RentalAllocation[];
}

const ACTIVE_STATUSES = [
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "active",
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Hook that returns a map of equipment_id -> RentalStatus, by querying
 * booking_items joined with bookings for current and upcoming rentals.
 */
export function useEquipmentRentalStatus() {
  const [statusMap, setStatusMap] = useState<Record<string, RentalStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const today = todayISO();

      const { data, error } = await supabase
        .from("booking_items")
        .select(`
          equipment_id,
          quantity,
          bookings!inner (
            booking_number,
            customer_name,
            customer_phone,
            rental_start,
            rental_end,
            status,
            is_archived
          )
        `)
        .in("bookings.status", ACTIVE_STATUSES)
        .eq("bookings.is_archived", false)
        .gte("bookings.rental_end", today);

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch rental status:", error);
        setStatusMap({});
        setLoading(false);
        return;
      }

      type Row = {
        equipment_id: string;
        quantity: number;
        bookings: {
          booking_number: string;
          customer_name: string;
          customer_phone: string | null;
          rental_start: string;
          rental_end: string;
          status: string;
        };
      };

      const rows = (data as unknown as Row[]) ?? [];
      const map: Record<string, RentalStatus> = {};

      for (const row of rows) {
        const eqId = row.equipment_id;
        if (!map[eqId]) {
          map[eqId] = {
            currentlyRented: 0,
            nextReturnDate: null,
            currentRentals: [],
            upcomingRentals: [],
          };
        }

        const allocation: RentalAllocation = {
          equipment_id: eqId,
          quantity: row.quantity,
          booking_number: row.bookings.booking_number,
          customer_name: row.bookings.customer_name,
          customer_phone: row.bookings.customer_phone,
          rental_start: row.bookings.rental_start,
          rental_end: row.bookings.rental_end,
          status: row.bookings.status,
        };

        const isCurrent = row.bookings.rental_start <= today && row.bookings.rental_end >= today;

        if (isCurrent) {
          map[eqId].currentlyRented += row.quantity;
          map[eqId].currentRentals.push(allocation);
          if (!map[eqId].nextReturnDate || row.bookings.rental_end < map[eqId].nextReturnDate) {
            map[eqId].nextReturnDate = row.bookings.rental_end;
          }
        } else if (row.bookings.rental_start > today) {
          map[eqId].upcomingRentals.push(allocation);
        }
      }

      // Sort upcoming by start date asc
      for (const eqId of Object.keys(map)) {
        map[eqId].upcomingRentals.sort((a, b) => a.rental_start.localeCompare(b.rental_start));
        map[eqId].currentRentals.sort((a, b) => a.rental_end.localeCompare(b.rental_end));
      }

      setStatusMap(map);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { statusMap, loading };
}
