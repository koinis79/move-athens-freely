import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Copy, Phone, Mail, MessageCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BookingConfirmation = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const bookingNumber = id || "MOV-20260401-001";

  const copyBookingNumber = () => {
    navigator.clipboard.writeText(bookingNumber);
    toast({ title: "Copied!", description: "Booking number copied to clipboard" });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-[700px]">
      {/* Success banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6">
          <CheckCircle2 className="h-12 w-12 text-accent" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-muted-foreground text-lg">
          Thank you for your booking. We'll deliver your equipment on the scheduled date.
        </p>
      </div>

      {/* Booking details card */}
      <div className="rounded-xl border bg-card p-6 md:p-8 space-y-5 mb-8">
        {/* Booking number + status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Booking Number</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-heading font-bold text-foreground tracking-wide">
                {bookingNumber}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyBookingNumber}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Badge className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/10 w-fit">
            Confirmed
          </Badge>
        </div>

        <div className="border-t" />

        {/* Order details */}
        <div className="space-y-3 text-sm">
          <Row label="Equipment" value="Lightweight Folding Wheelchair × 1" />
          <Row label="Rental Period" value="April 1 – April 7, 2026 (7 days)" />
          <Row label="Delivery To" value="Hotel Grande Bretagne, Syntagma Square" />
          <Row label="Delivery Time" value="Morning (9am–12pm)" />
        </div>

        <div className="border-t" />

        {/* Pricing */}
        <div className="space-y-2 text-sm">
          <Row label="Equipment Subtotal" value="€60.00" />
          <Row label="Delivery Fee" value="Free" />
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-heading font-bold text-foreground">Total Paid</span>
            <span className="text-xl font-bold text-primary">€60.00</span>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="rounded-xl border bg-card p-6 md:p-8 mb-8">
        <h2 className="font-heading text-lg font-bold text-foreground mb-5">What happens next</h2>
        <div className="space-y-4">
          {[
            { emoji: "📧", text: "Confirmation email sent to john@example.com" },
            { emoji: "🚚", text: "We'll deliver your equipment on April 1st between 9am–12pm" },
            { emoji: "📞", text: "We'll contact you the day before to confirm delivery details" },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5">{step.emoji}</span>
              <p className="text-sm text-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support section */}
      <div className="rounded-xl border bg-card p-6 md:p-8 mb-8 text-center">
        <h2 className="font-heading text-lg font-bold text-foreground mb-2">Questions about your booking?</h2>
        <p className="text-sm text-muted-foreground mb-5">Our team is here to help</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <a href={`https://wa.me/306900000000?text=${encodeURIComponent(`Hi, I have a question about booking ${bookingNumber}`)}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <a href="mailto:info@moveability.gr">
              <Mail className="h-4 w-4" /> Email Us
            </a>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <a href="tel:+302100000000">
              <Phone className="h-4 w-4" /> +30 210 000 0000
            </a>
          </Button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild size="lg" className="rounded-xl w-full sm:w-auto">
          <Link to="/dashboard">View My Bookings</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl w-full sm:w-auto">
          <Link to="/equipment">Browse More Equipment</Link>
        </Button>
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" /> Print Confirmation
        </Button>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium text-right">{value}</span>
  </div>
);

export default BookingConfirmation;
