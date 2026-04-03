import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { format } from "date-fns";
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

interface BookingItem {
  quantity: number;
  num_days: number;
  subtotal: number;
  equipment: {
    name_en: string;
    slug: string;
  } | null;
}

interface Booking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string | null;
  delivery_time_slot: string | null;
  rental_start: string;
  rental_end: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_type: string;
  amount_paid: number;
  amount_due: number;
  status: string;
  created_at: string;
  delivery_zones: {
    name_en: string;
    delivery_fee: number;
  } | null;
  booking_items: BookingItem[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  active: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-2 border-b last:border-0">
    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
    <span className="text-sm font-medium text-foreground text-right">{value}</span>
  </div>
);

const BookingConfirmation = () => {
  const { id: bookingNumber } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Clear cart once when arriving from a successful Stripe payment
  useEffect(() => {
    if (searchParams.get("paid") === "1") {
      clearCart();
      // GA4: fire purchase event — booking data may not yet be loaded, so we
      // use the booking number from the URL as the transaction_id and fill in
      // value once booking loads (see second useEffect below).
      trackEvent("purchase_initiated", { booking_number: bookingNumber ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!bookingNumber) return;

    supabase
      .rpc("get_booking_by_number", { p_booking_number: bookingNumber })
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          const b = data as unknown as Booking;
          setBooking(b);
          if (searchParams.get("paid") === "1") {
            trackEvent("purchase", {
              transaction_id: b.booking_number,
              value: b.total_amount,
              currency: "EUR",
              shipping: b.delivery_fee,
            });
          }
        }
        setLoading(false);
      });
  }, [bookingNumber]);

  const copyBookingNumber = () => {
    if (!bookingNumber) return;
    navigator.clipboard.writeText(bookingNumber);
    toast({ title: "Copied!", description: "Booking number copied to clipboard." });
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container py-20 flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p>Loading your booking...</p>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────
  if (notFound || !booking) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-heading font-bold mb-3">Booking not found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find a booking with reference <strong>{bookingNumber}</strong>.
        </p>
        <Button asChild><Link to="/equipment">Browse Equipment</Link></Button>
      </div>
    );
  }

  const whatsappMsg = encodeURIComponent(
    `Hi! I have a booking with reference ${booking.booking_number}. I need help with my rental.`
  );

  // ── Confirmation page ──────────────────────────────────────────────────
  return (
    <div className="container py-10 md:py-16 max-w-3xl">
      {/* Success banner */}
      <div className="rounded-2xl bg-accent/10 border border-accent/30 p-8 text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
          <CheckCircle2 className="h-9 w-9 text-accent" />
        </div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
          Booking Received!
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          We'll confirm your booking by email and WhatsApp within 2 hours.
          Our team will contact you to arrange delivery details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Booking details */}
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-heading font-semibold text-lg text-foreground">
              Booking Details
            </h2>
            <Badge
              variant="outline"
              className={`capitalize font-semibold ${statusColors[booking.status] ?? ""}`}
            >
              {booking.status.replace("_", " ")}
            </Badge>
          </div>

          {/* Booking number */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Booking reference</p>
              <p className="font-mono font-bold text-foreground text-lg tracking-wide">
                {booking.booking_number}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyBookingNumber}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Row label="Name" value={booking.customer_name} />
            <Row label="Email" value={booking.customer_email} />
            {booking.customer_phone && (
              <Row label="Phone" value={booking.customer_phone} />
            )}
            <Row
              label="Rental period"
              value={`${format(new Date(booking.rental_start), "dd MMM yyyy")} → ${format(new Date(booking.rental_end), "dd MMM yyyy")}`}
            />
            {booking.delivery_zones && (
              <Row label="Delivery zone" value={booking.delivery_zones.name_en} />
            )}
            {booking.delivery_address && (
              <Row label="Address" value={booking.delivery_address} />
            )}
            {booking.delivery_time_slot && (
              <Row
                label="Delivery time"
                value={
                  booking.delivery_time_slot.charAt(0).toUpperCase() +
                  booking.delivery_time_slot.slice(1)
                }
              />
            )}
          </div>
        </div>

        {/* Price summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h2 className="font-heading font-semibold text-lg text-foreground">
              Items
            </h2>

            <div className="space-y-3">
              {booking.booking_items.map((item, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.equipment?.name_en ?? "Equipment"}
                      {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.num_days} day{item.num_days !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground shrink-0">
                    €{item.subtotal}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipment</span>
                <span>€{booking.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>
                  {booking.delivery_fee === 0 ? "Free" : `€${booking.delivery_fee}`}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-base">
                <span>Total</span>
                <span className="text-primary">€{booking.total_amount}</span>
                    {booking.payment_type === "deposit" && booking.amount_due > 0 && (
                      <div className="mt-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 px-4 py-3 text-sm">
                        <p className="font-medium text-orange-800 dark:text-orange-300">
                          Deposit paid: €{Number(booking.amount_paid).toFixed(0)}
                        </p>
                        <p className="text-orange-700 dark:text-orange-400">
                          Remaining €{Number(booking.amount_due).toFixed(0)} due on delivery (cash or card)
                        </p>
                      </div>
                    )}
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="rounded-2xl border bg-card p-6 space-y-3">
            <h2 className="font-heading font-semibold text-foreground">
              What happens next
            </h2>
            <div className="space-y-3 text-sm">
              {[
                { icon: "📧", text: "Confirmation email sent to " + booking.customer_email },
                { icon: "📞", text: "We'll call or WhatsApp within 2 hours to confirm" },
                { icon: "🚚", text: "Equipment delivered at your chosen time" },
                { icon: "♿", text: "Quick demo on arrival — enjoy Athens!" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex gap-3">
                  <span className="text-lg shrink-0">{icon}</span>
                  <span className="text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact / support */}
      <div className="mt-6 rounded-2xl border bg-card p-6">
        <h2 className="font-heading font-semibold text-foreground mb-4">
          Need help?
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-xl bg-[#25D366] hover:bg-[#22bc5a] text-white">
            <a
              href={`https://wa.me/306974633697?text=Hi!%20I%27m%20interested%20in%20renting%20mobility%20equipment%20in%20Athens.?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <a href="mailto:info@moveability.gr">
              <Mail className="mr-2 h-4 w-4" />
              info@moveability.gr
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <a href="tel:+306974633697">
              <Phone className="mr-2 h-4 w-4" />
              +30 697 463 3697
            </a>
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/equipment">Browse More Equipment</Link>
        </Button>
        <Button
          variant="ghost"
          className="rounded-xl"
          onClick={() => window.print()}
        >
          Print Confirmation
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
