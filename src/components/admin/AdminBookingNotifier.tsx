import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, BellRing } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Permission = "default" | "granted" | "denied" | "unsupported";

interface NewBookingPayload {
  id: string;
  booking_number: string;
  customer_name: string;
  total_amount: number;
}

const ICON_URL =
  "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/movability-logo-icon.png";

/**
 * Admin-only: requests browser notification permission, subscribes to
 * Supabase realtime on `bookings` INSERT, and fires a native notification
 * when a new booking arrives. Click routes to /admin/bookings.
 *
 * Mount once inside AdminLayout.
 */
export default function AdminBookingNotifier() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [permission, setPermission] = useState<Permission>("default");

  // Detect initial permission state
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as Permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as Permission);
    if (result === "granted") {
      toast({ title: "Notifications enabled", description: "You'll be alerted when new bookings arrive." });
    } else if (result === "denied") {
      toast({ title: "Notifications blocked", description: "Enable them in your browser settings.", variant: "destructive" });
    }
  }, [toast]);

  // Realtime subscription — active only when granted
  useEffect(() => {
    if (permission !== "granted") return;

    const channel = supabase
      .channel("admin-new-bookings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          const b = payload.new as NewBookingPayload;
          const amount = Number(b.total_amount ?? 0).toFixed(0);
          const title = "New Booking!";
          const body = `${b.booking_number} · ${b.customer_name} · €${amount}`;

          try {
            const n = new Notification(title, {
              body,
              icon: ICON_URL,
              tag: b.booking_number,
              requireInteraction: false,
            });
            n.onclick = () => {
              window.focus();
              navigate("/admin/bookings");
              n.close();
            };
          } catch (err) {
            console.error("Notification failed:", err);
          }

          // Also show an in-app toast in case the tab is focused
          toast({
            title: title,
            description: body,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [permission, navigate, toast]);

  // "Enable notifications" button — only shown if permission not granted
  if (permission === "granted") {
    return (
      <button
        type="button"
        disabled
        title="Notifications enabled"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 cursor-default"
      >
        <BellRing className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Live</span>
      </button>
    );
  }

  if (permission === "unsupported") return null;

  if (permission === "denied") {
    return (
      <button
        type="button"
        disabled
        title="Blocked — enable in browser settings"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 cursor-not-allowed"
      >
        <BellOff className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Blocked</span>
      </button>
    );
  }

  // default state: prompt user
  return (
    <button
      type="button"
      onClick={requestPermission}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-primary bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
    >
      <Bell className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Enable Notifications</span>
      <span className="sm:hidden">Alerts</span>
    </button>
  );
}
