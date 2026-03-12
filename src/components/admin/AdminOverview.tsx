import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CalendarCheck, Activity, Euro, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Stats {
  todayBookings: number;
  activeRentals: number;
  revenueThisMonth: number;
  pendingInquiries: number;
}

interface RecentBooking {
  id: string;
  booking_number: string;
  customer_name: string;
  total_amount: number;
  rental_start: string;
  rental_end: string;
  status: string;
  booking_items: { equipment: { name_en: string } | null }[];
}

const statusColor: Record<string, string> = {
  pending:   "bg-secondary/15 text-secondary border-secondary/30",
  confirmed: "bg-primary/15 text-primary border-primary/30",
  active:    "bg-accent/15 text-accent border-accent/30",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];
      const monthStart = today.slice(0, 8) + "01";

      const [
        { count: todayCount },
        { count: activeCount },
        { data: revenueData },
        { count: inquiryCount },
        { data: bookings },
      ] = await Promise.all([
        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today + "T00:00:00")
          .lte("created_at", today + "T23:59:59"),
        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("bookings")
          .select("total_amount")
          .eq("payment_status", "paid")
          .gte("created_at", monthStart),
        supabase
          .from("contact_inquiries")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false),
        supabase
          .from("bookings")
          .select(`
            id, booking_number, customer_name, total_amount,
            rental_start, rental_end, status,
            booking_items ( equipment ( name_en ) )
          `)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const revenue = (revenueData ?? []).reduce(
        (sum: number, b: { total_amount: number }) => sum + Number(b.total_amount),
        0
      );

      setStats({
        todayBookings: todayCount ?? 0,
        activeRentals: activeCount ?? 0,
        revenueThisMonth: revenue,
        pendingInquiries: inquiryCount ?? 0,
      });
      setRecentBookings((bookings as RecentBooking[]) ?? []);
      setLoading(false);
    };

    load();
  }, []);

  const statCards = stats
    ? [
        { label: "Today's Bookings", value: String(stats.todayBookings), icon: CalendarCheck, color: "text-primary" },
        { label: "Active Rentals", value: String(stats.activeRentals), icon: Activity, color: "text-accent" },
        { label: "Revenue This Month", value: `€${stats.revenueThisMonth.toLocaleString()}`, icon: Euro, color: "text-secondary" },
        { label: "Pending Inquiries", value: String(stats.pendingInquiries), icon: Mail, color: "text-destructive" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold font-heading">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2"><Skeleton className="h-4 w-32" /></CardHeader>
                <CardContent><Skeleton className="h-8 w-16" /></CardContent>
              </Card>
            ))
          : statCards.map((s) => (
              <Card key={s.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <s.icon className={cn("h-5 w-5", s.color)} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold font-heading">{s.value}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold font-heading mb-4">Recent Bookings</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : recentBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.booking_number}</TableCell>
                      <TableCell>{b.customer_name}</TableCell>
                      <TableCell>
                        {b.booking_items?.[0]?.equipment?.name_en ?? "—"}
                        {b.booking_items?.length > 1 ? ` +${b.booking_items.length - 1}` : ""}
                      </TableCell>
                      <TableCell className="text-xs">
                        {b.rental_start} → {b.rental_end}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs capitalize", statusColor[b.status])}>
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">€{Number(b.total_amount).toFixed(0)}</TableCell>
                    </TableRow>
                  ))}
              {!loading && recentBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No bookings yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
