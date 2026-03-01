import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Package, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  status: "confirmed" | "delivered" | "completed" | "cancelled";
  equipmentName: string;
  thumbnail: string;
  dates: string;
  total: string;
  deliveryAddress: string;
  paymentMethod: string;
}

const statusConfig: Record<Booking["status"], { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-primary/10 text-primary border-primary/20" },
  delivered: { label: "Delivered", className: "bg-accent/10 text-accent border-accent/20" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const mockBookings: Booking[] = [
  {
    id: "MOV-20260401-001",
    status: "confirmed",
    equipmentName: "Lightweight Folding Wheelchair",
    thumbnail: "/placeholder.svg",
    dates: "Apr 1 – Apr 7, 2026",
    total: "€60.00",
    deliveryAddress: "Hotel Grande Bretagne, Syntagma Square",
    paymentMethod: "Visa ending in 4242",
  },
  {
    id: "MOV-20260315-003",
    status: "completed",
    equipmentName: "Portable Mobility Scooter",
    thumbnail: "/placeholder.svg",
    dates: "Mar 15 – Mar 20, 2026",
    total: "€125.00",
    deliveryAddress: "Athens Hilton, Vasilissis Sofias Ave",
    paymentMethod: "Mastercard ending in 8888",
  },
];

const MyBookings = () => {
  const bookings = mockBookings;

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
  const status = statusConfig[booking.status];

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
                  {booking.id}
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
                <span>{booking.paymentMethod}</span>
              </div>
              <div className="pt-2">
                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                  <a href="mailto:support@moveability.gr">
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
