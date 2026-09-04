import { ChevronRight, Clock, Truck, Package, TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { useAdminBookings, type AdminBooking } from "@/hooks/useAdminBookings";

/* ── Status badge config ── */
const statusConfig: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800 border-blue-200" },
  active:    { label: "Active",    className: "bg-orange-100 text-orange-800 border-orange-200" },
  delivered: { label: "Delivered", className: "bg-orange-100 text-orange-800 border-orange-200" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
};

/* ── Stat Card ── */
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  loading?: boolean;
  onClick?: () => void;
  subtitle?: string;
}

const StatCard = ({ title, value, icon: Icon, accentColor, accentBg, loading, onClick, subtitle }: StatCardProps) => {
  const Wrap: React.ElementType = onClick ? "button" : "div";
  const wrapProps = onClick
    ? { type: "button" as const, onClick, className: "text-left w-full" }
    : {};
  return (
    <Wrap {...wrapProps}>
      <Card className={`border border-border shadow-sm transition-all ${onClick ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : ""}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
                  {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </>
              )}
            </div>
            <div className={`rounded-xl p-3 shrink-0 ${accentBg}`}>
              <Icon className={`h-5 w-5 ${accentColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Wrap>
  );
};

/* ── Overview stats (derived from the loaded bookings) ── */
// Test rows excluded from money figures — same rule as the accounting export.
const TEST_EMAILS = new Set(["kalogeropoulosbill6@gmail.com"]);

// Effective amount actually received (accounting-export rule): a fully-paid
// booking is worth its total (absorbs the pre-Aug-16 amount_paid=0 artifact),
// a deposit is worth what was put down.
function effectiveReceived(b: AdminBooking): number {
  if (b.payment_status === "paid") return Number(b.total_amount || 0);
  if (b.payment_status === "deposit_paid") return Number(b.amount_paid || 0);
  return Number(b.amount_paid || 0);
}

interface OverviewStats {
  revenueThisMonth: number;
  revenueLastMonth: number;
  deliveriesTodayTomorrow: number;
  totalOutstanding: number;
  unitsOut: number;
  bookingsOut: number;
}

function computeStats(bookings: AdminBooking[]): OverviewStats {
  const now = new Date();
  const todayISO = now.toISOString().slice(0, 10);
  const tomorrowISO = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  const thisMonth = todayISO.slice(0, 7); // YYYY-MM
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

  let revenueThisMonth = 0;
  let revenueLastMonth = 0;
  let totalOutstanding = 0;
  let deliveriesTodayTomorrow = 0;
  let unitsOut = 0;
  let bookingsOut = 0;

  for (const b of bookings) {
    const isTest = TEST_EMAILS.has((b.customer_email ?? "").toLowerCase());
    const createdMonth = (b.created_at ?? "").slice(0, 7);

    if (!isTest) {
      if (createdMonth === thisMonth) revenueThisMonth += effectiveReceived(b);
      else if (createdMonth === lastMonth) revenueLastMonth += effectiveReceived(b);

      // Money still owed — deposits (balance) + unpaid bookings.
      if (b.payment_status === "deposit_paid" || b.payment_status === "pending" || b.payment_status === "failed") {
        totalOutstanding += Number(b.amount_due ?? 0);
      }
    }

    if (b.status !== "cancelled" && (b.rental_start === todayISO || b.rental_start === tomorrowISO)) {
      deliveriesTodayTomorrow++;
    }

    if (b.status === "delivered") {
      bookingsOut++;
      unitsOut += (b.booking_items ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0);
    }
  }

  return { revenueThisMonth, revenueLastMonth, deliveriesTodayTomorrow, totalOutstanding, unitsOut, bookingsOut };
}

/* ── Date formatter ── */
const fmtDate = (dateStr: string) => {
  const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/* ── Skeleton rows ── */
const TableSkeleton = ({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) => (
  <tbody>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i} className="border-b border-border last:border-0">
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="px-4 py-3">
            <Skeleton className="h-4 w-full max-w-[120px]" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

/* ── Main Dashboard ── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { bookings, loading: bookingsLoading } = useAdminBookings();
  const overview = useMemo(() => computeStats(bookings), [bookings]);
  const overviewLoading = bookingsLoading;
  const recentBookings = bookings.slice(0, 10);

  const revenueDelta = overview.revenueThisMonth - overview.revenueLastMonth;
  const revenueUp = revenueDelta >= 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back — here's what's happening today.</p>
      </div>

      {/* ── Top Row: Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Revenue This Month"
          value={`€${Math.round(overview.revenueThisMonth).toLocaleString()}`}
          icon={revenueUp ? TrendingUp : TrendingDown}
          accentColor="text-emerald-700"
          accentBg="bg-emerald-100"
          loading={overviewLoading}
          onClick={() => navigate("/admin/bookings")}
          subtitle={
            overview.revenueLastMonth > 0 || overview.revenueThisMonth > 0
              ? `${revenueUp ? "▲" : "▼"} €${Math.abs(Math.round(revenueDelta)).toLocaleString()} vs last month (€${Math.round(overview.revenueLastMonth).toLocaleString()})`
              : "Effective received"
          }
        />
        <StatCard
          title="Deliveries Today + Tomorrow"
          value={String(overview.deliveriesTodayTomorrow)}
          icon={Truck}
          accentColor="text-blue-700"
          accentBg="bg-blue-100"
          loading={overviewLoading}
          onClick={() => navigate("/admin/calendar")}
          subtitle="Scheduled to go out"
        />
        <StatCard
          title="Total Outstanding"
          value={`€${Math.round(overview.totalOutstanding).toLocaleString()}`}
          icon={Clock}
          accentColor="text-amber-700"
          accentBg="bg-amber-100"
          loading={overviewLoading}
          onClick={() => navigate("/admin/bookings?status=pending")}
          subtitle="Balance due (deposits + unpaid)"
        />
        <StatCard
          title="Equipment Out"
          value={String(overview.bookingsOut)}
          icon={Package}
          accentColor="text-purple-700"
          accentBg="bg-purple-100"
          loading={overviewLoading}
          onClick={() => navigate("/admin/bookings?status=delivered")}
          subtitle={`${overview.unitsOut} unit${overview.unitsOut !== 1 ? "s" : ""} on rental now`}
        />
      </div>

      {/* ── Recent Bookings ── */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">Recent Bookings</CardTitle>
            <Link to="/admin/bookings" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Booking ID</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Customer</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap hidden md:table-cell">Equipment</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap hidden lg:table-cell">Dates</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Status</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Amount</th>
                </tr>
              </thead>
              {bookingsLoading ? (
                <TableSkeleton />
              ) : (
                <tbody>
                  {recentBookings.map((b) => {
                    const sc = statusConfig[b.status] ?? statusConfig.pending;
                    const equipmentName = b.booking_items?.[0]?.equipment?.name_en ?? "—";
                    const extraItems = (b.booking_items?.length ?? 0) > 1 ? ` +${(b.booking_items?.length ?? 1) - 1}` : "";
                    return (
                      <tr
                        key={b.id}
                        onClick={() => navigate("/admin/bookings")}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-primary font-semibold whitespace-nowrap">{b.booking_number}</td>
                        <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">{b.customer_name}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap hidden md:table-cell">{equipmentName}{extraItems}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap hidden lg:table-cell">{fmtDate(b.rental_start)} – {fmtDate(b.rental_end)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[11px] font-semibold border ${sc.className}`}>{sc.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground whitespace-nowrap">€{Number(b.total_amount).toFixed(0)}</td>
                      </tr>
                    );
                  })}
                  {recentBookings.length === 0 && !bookingsLoading && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground">No bookings yet.</td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
