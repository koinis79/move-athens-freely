import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Package, MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  equipmentName: string;
  thumbnail: string;
  dates: string;
  total: string;
  deliveryAddress: string;
  paymentStatus: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-secondary/10 text-secondary border-secondary/20" },
  confirmed: { label: "Confirmed", className: "bg-primary/10 text-primary border-primary/20" },
  delivered: { label: "Delivered", className: "bg-accent/10 text-accent border-accent/20" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const paymentLabels: Record<string, string> = {
  paid: "Paid",
  deposit_paid: "Deposit paid",
  pending: "Awaiting payment",
  refunded: "Refunded",
  failed: "Payment failed",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Shape of a row returned by the Supabase query below.
interface BookingRow {
  id: string;
  booking_number: string;
  status: string;
  payment_status: string;
  rental_start: string;
  rental_end: string;
  total_amount: number;
  delivery_address: string | null;
  booking_items: {
    quantity: number;
    equipment: { name_en: string; images: string[] } | null;
  }[] | null;
}

function mapRow(r: BookingRow): Booking {
  const items = r.booking_items ?? [];
  const first = items[0]?.equipment ?? null;
  const extra = items.length - 1;
  const baseName = first?.name_en ?? "Mobility equipment";
  const equipmentName = extra > 0 ? `${baseName} +${extra} more` : baseName;

  return {
    id: r.id,
    bookingNumber: r.booking_number,
    status: r.status,
    equipmentName,
    thumbnail: first?.images?.[0] ?? "/placeholder.svg",
    dates: `${formatDate(r.rental_start)} – ${formatDate(r.rental_end)}`,
    total: `€${Number(r.total_amount).toFixed(2)}`,
    deliveryAddress: r.delivery_address || "Store pickup",
    paymentStatus: paymentLabels[r.payment_status] ?? r.payment_status,
  };
}

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null); // null = still loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        setBookings([]);
        return;
      }
      setBookings(null);
      setError(null);

      // Scope to the logged-in user by user_id OR the email on the booking.
      // RLS already restricts rows to the current user (or admins) — this
      // explicit filter also keeps admins from seeing everyone else's here.
      const orFilters = [`user_id.eq.${user.id}`];
      if (user.email) orFilters.push(`customer_email.eq.${user.email}`);

      const { data, error: err } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_number,
          status,
          payment_status,
          rental_start,
          rental_end,
          total_amount,
          delivery_address,
          booking_items ( quantity, equipment ( name_en, images ) )
        `)
        .or(orFilters.join(","))
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (err) {
        setError(err.message);
        setBookings([]);
        return;
      }
      setBookings(((data as BookingRow[]) ?? []).map(mapRow));
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email]);

  // Loading — spinner, never fake cards.
  if (bookings === null) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="sr-only">Loading your bookings…</span>
        </div>
      </div>
    );
  }

  // Error state.
  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            We couldn't load your bookings just now. Please try again in a moment.
          </p>
          <Button asChild variant="outline">
            <a href="mailto:info@movability.gr">Contact Support</a>
          </Button>
        </div>
      </div>
    );
  }

  // Genuine empty state.
  if (bookings.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            No bookings yet. Browse equipment to get started.
          </p>
          <Button asChild>
            <Link to="/equipment">Browse Equipment</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
};

const BookingCard = ({ booking }: { booking: Booking }) => {
  const [open, setOpen] = useState(false);
  const status = statusConfig[booking.status] ?? {
    label: booking.status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <img
              src={booking.thumbnail}
              alt={booking.equipmentName}
              className="w-16 h-16 rounded-lg object-cover bg-muted shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-mono font-medium text-muted-foreground">
                  {booking.bookingNumber}
                </span>
                <Badge variant="outline" className={cn("text-xs", status.className)}>
                  {status.label}
                </Badge>
              </div>
              <p className="font-semibold truncate">{booking.equipmentName}</p>
              <div className="flex items-center justify-between mt-1 text-sm text-muted-foreground">
                <span>{booking.dates}</span>
                <span className="font-medium text-foreground">{booking.total}</span>
              </div>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground">
              <span>{open ? "Hide" : "View"} Details</span>
              <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", open && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t mt-3 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Address</span>
                <span className="text-right">{booking.deliveryAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span>{booking.paymentStatus}</span>
              </div>
              <div className="pt-2">
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <a href="mailto:info@movability.gr">
                    <MessageCircle className="mr-1 h-3.5 w-3.5" />
                    Contact Support
                  </a>
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
};

export default MyBookings;
