import { useMemo, useState } from "react";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, BarChart, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, PieChart, Pie, Legend,
} from "recharts";
import { Euro, TrendingUp, Package, ShoppingCart, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminBookings, type AdminBooking } from "@/hooks/useAdminBookings";
import { isTestBooking, isSettled, effectiveReceived, paymentChannel } from "@/lib/accounting";

// ── Brand palette ──
const PRIMARY = "#2563EB";   // blue
const SECONDARY = "#F59E0B"; // amber
const ACCENT = "#65A30D";    // green
const GRID = "#9CA3AF";      // muted grey (readable both themes)
const AXIS = "#9CA3AF";
const CHANNEL_COLORS: Record<string, string> = { Stripe: PRIMARY, "Cash/Manual": SECONDARY };

const eur0 = (n: number) => `€${Math.round(n).toLocaleString()}`;
const eur2 = (n: number) => `€${n.toFixed(2)}`;

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type PeriodId = "this_month" | "last_month" | "last_90" | "this_year" | "all";
const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "last_90", label: "Last 90 days" },
  { id: "this_year", label: "This year" },
  { id: "all", label: "All time" },
];

// [startISO inclusive, endISO exclusive) over created_at date.
function periodBounds(p: PeriodId): { start: string; end: string; label: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const firstThis = new Date(y, m, 1);
  switch (p) {
    case "this_month":
      return { start: iso(firstThis), end: iso(new Date(y, m + 1, 1)), label: "this month" };
    case "last_month":
      return { start: iso(new Date(y, m - 1, 1)), end: iso(firstThis), label: "last month" };
    case "last_90":
      return { start: iso(new Date(now.getTime() - 89 * 86400000)), end: iso(new Date(now.getTime() + 86400000)), label: "last 90 days" };
    case "this_year":
      return { start: `${y}-01-01`, end: `${y + 1}-01-01`, label: "this year" };
    case "all":
    default:
      return { start: "0000-01-01", end: "9999-12-31", label: "all time" };
  }
}

const createdISO = (b: AdminBooking) => (b.created_at ?? "").slice(0, 10);

/* ── Stat card ── */
function StatCard({ title, value, subtitle, icon: Icon, tint }: {
  title: string; value: string; subtitle?: string; icon: React.ElementType; tint: string;
}) {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="rounded-xl p-2.5 shrink-0" style={{ backgroundColor: `${tint}1A` }}>
            <Icon className="h-5 w-5" style={{ color: tint }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const Empty = ({ h = 240 }: { h?: number }) => (
  <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height: h }}>
    No data for this period
  </div>
);

const AdminAnalyticsPage = () => {
  const { bookings, loading } = useAdminBookings();
  const [period, setPeriod] = useState<PeriodId>("last_90");

  const data = useMemo(() => {
    const { start, end, label } = periodBounds(period);
    const nonTest = bookings.filter((b) => !isTestBooking(b));
    const inPeriod = (b: AdminBooking) => { const c = createdISO(b); return c >= start && c < end; };

    const periodAll = nonTest.filter(inPeriod);                                   // all non-test in period
    const periodNonCancelled = periodAll.filter((b) => b.status !== "cancelled");
    const periodSettled = periodNonCancelled.filter(isSettled);                   // revenue-eligible

    // 1. Headline
    const revenue = periodSettled.reduce((s, b) => s + effectiveReceived(b), 0);
    const bookingsCount = periodSettled.length;
    const avg = bookingsCount ? revenue / bookingsCount : 0;
    const outstanding = periodNonCancelled.reduce((s, b) => s + Number(b.amount_due || 0), 0);

    // 2. Revenue trend — independent of the picker; last 12 months of history.
    const settledAll = nonTest.filter((b) => b.status !== "cancelled" && isSettled(b));
    const byMonth = new Map<string, { revenue: number; count: number }>();
    for (const b of settledAll) {
      const key = createdISO(b).slice(0, 7); // YYYY-MM
      if (!key) continue;
      const cur = byMonth.get(key) ?? { revenue: 0, count: 0 };
      cur.revenue += effectiveReceived(b);
      cur.count += 1;
      byMonth.set(key, cur);
    }
    const monthKeys = [...byMonth.keys()].sort();
    let trend: { month: string; revenue: number; count: number }[] = [];
    if (monthKeys.length) {
      const first = monthKeys[0];
      const now = new Date();
      // Build a continuous month axis from the earliest booking month → current month.
      const axis: string[] = [];
      let cur = new Date(Number(first.slice(0, 4)), Number(first.slice(5, 7)) - 1, 1);
      const stop = new Date(now.getFullYear(), now.getMonth(), 1);
      while (cur <= stop) {
        axis.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`);
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      }
      const recent = axis.slice(-12);
      trend = recent.map((k) => {
        const v = byMonth.get(k) ?? { revenue: 0, count: 0 };
        const mi = Number(k.slice(5, 7)) - 1;
        return { month: `${MONTH_ABBR[mi]} ${k.slice(2, 4)}`, revenue: Math.round(v.revenue * 100) / 100, count: v.count };
      });
    }

    // 3. Product mix — split each booking's effective revenue across its items by subtotal share.
    const prod = new Map<string, { revenue: number; count: number }>();
    for (const b of periodSettled) {
      const eff = effectiveReceived(b);
      const items = b.booking_items ?? [];
      const itemsTotal = items.reduce((s, i) => s + Number(i.subtotal || 0), 0);
      for (const i of items) {
        const name = i.equipment?.name_en ?? "Unknown";
        const share = itemsTotal > 0 ? Number(i.subtotal || 0) / itemsTotal : (items.length ? 1 / items.length : 0);
        const cur = prod.get(name) ?? { revenue: 0, count: 0 };
        cur.revenue += eff * share;
        cur.count += 1;
        prod.set(name, cur);
      }
    }
    const products = [...prod.entries()]
      .map(([name, v]) => ({ name, revenue: Math.round(v.revenue * 100) / 100, count: v.count }))
      .sort((a, b) => b.revenue - a.revenue);

    // 4. Channel split
    const chan = new Map<string, { revenue: number; count: number }>();
    for (const b of periodSettled) {
      const ch = paymentChannel(b);
      const cur = chan.get(ch) ?? { revenue: 0, count: 0 };
      cur.revenue += effectiveReceived(b);
      cur.count += 1;
      chan.set(ch, cur);
    }
    const channels = ["Stripe", "Cash/Manual"]
      .map((ch) => { const v = chan.get(ch) ?? { revenue: 0, count: 0 }; return { name: ch, revenue: Math.round(v.revenue * 100) / 100, count: v.count, avg: v.count ? v.revenue / v.count : 0 }; })
      .filter((c) => c.count > 0);

    // 5. Delivery zones
    const zoneMap = new Map<string, { revenue: number; count: number }>();
    for (const b of periodSettled) {
      const zone = b.delivery_zones?.name_en ?? "—";
      const cur = zoneMap.get(zone) ?? { revenue: 0, count: 0 };
      cur.revenue += effectiveReceived(b);
      cur.count += 1;
      zoneMap.set(zone, cur);
    }
    const zones = [...zoneMap.entries()]
      .map(([name, v]) => ({ name, revenue: Math.round(v.revenue * 100) / 100, count: v.count }))
      .sort((a, b) => b.revenue - a.revenue);

    // 6. Operations
    const cancellationRate = periodAll.length ? periodAll.filter((b) => b.status === "cancelled").length / periodAll.length : 0;
    const emailCounts = new Map<string, number>();
    for (const b of periodSettled) {
      const e = (b.customer_email ?? "").toLowerCase();
      if (e) emailCounts.set(e, (emailCounts.get(e) ?? 0) + 1);
    }
    const distinctCustomers = emailCounts.size;
    const repeatCustomers = [...emailCounts.values()].filter((n) => n > 1).length;
    const repeatShare = distinctCustomers ? repeatCustomers / distinctCustomers : 0;
    const avgRentalLength = periodNonCancelled.length
      ? periodNonCancelled.reduce((s, b) => s + Number(b.num_days || 0), 0) / periodNonCancelled.length
      : 0;
    const sameDay = periodNonCancelled.filter((b) => b.rental_start === createdISO(b)).length;
    const sameDayShare = periodNonCancelled.length ? sameDay / periodNonCancelled.length : 0;

    return {
      label, revenue, bookingsCount, avg, outstanding, trend, products, channels, zones,
      totalRevenueShare: channels.reduce((s, c) => s + c.revenue, 0),
      ops: { cancellationRate, repeatShare, repeatCustomers, distinctCustomers, avgRentalLength, sameDayShare, sameDay, total: periodNonCancelled.length },
    };
  }, [bookings, period]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <Skeleton className="h-[320px] w-full" />
      </div>
    );
  }

  const tooltipStyle = {
    contentStyle: { borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 },
    labelStyle: { fontWeight: 600 },
  };

  return (
    <div className="space-y-6">
      {/* Header + period picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics <span className="text-muted-foreground font-normal text-lg">· Οικονομικά</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Revenue is effective amount received; test bookings excluded, archived included, cancelled excluded from revenue.</p>
        </div>
        <div className="inline-flex flex-wrap rounded-lg border border-border bg-card p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${period === p.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Headline */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Revenue" value={eur0(data.revenue)} subtitle={`Effective · ${data.label}`} icon={Euro} tint={ACCENT} />
        <StatCard title="Bookings" value={String(data.bookingsCount)} subtitle="Paid & deposit" icon={ShoppingCart} tint={PRIMARY} />
        <StatCard title="Avg booking value" value={eur0(data.avg)} subtitle="Revenue ÷ bookings" icon={TrendingUp} tint={SECONDARY} />
        <StatCard title="Outstanding" value={eur0(data.outstanding)} subtitle="Balance due (non-cancelled)" icon={Wallet} tint="#6B7280" />
      </div>

      {/* 2. Revenue trend */}
      <ChartCard title="Revenue trend" subtitle="Effective revenue per month · last 12 months (independent of the period above)">
        {data.trend.length === 0 ? <Empty h={300} /> : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.trend} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
              <CartesianGrid stroke={GRID} strokeOpacity={0.2} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID, strokeOpacity: 0.3 }} />
              <YAxis yAxisId="left" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => eur0(Number(v))} width={64} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number | string, n: string) => n === "revenue" ? [eur2(Number(v)), "Revenue"] : [String(v), "Bookings"]} />
              <Bar yAxisId="left" dataKey="revenue" fill={PRIMARY} fillOpacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={44} />
              <Line yAxisId="right" type="monotone" dataKey="count" stroke={SECONDARY} strokeWidth={2} dot={{ r: 3, fill: SECONDARY }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* 3. Product mix */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Revenue by product" subtitle={`Effective revenue · ${data.label}`}>
          {data.products.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={Math.max(200, data.products.length * 40)}>
              <BarChart layout="vertical" data={data.products} margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid stroke={GRID} strokeOpacity={0.2} horizontal={false} />
                <XAxis type="number" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => eur0(Number(v))} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v: number | string) => [eur2(Number(v)), "Revenue"]} />
                <Bar dataKey="revenue" fill={ACCENT} fillOpacity={0.85} radius={[0, 4, 4, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Bookings by product" subtitle={`Count · ${data.label}`}>
          {data.products.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={Math.max(200, data.products.length * 40)}>
              <BarChart layout="vertical" data={data.products} margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid stroke={GRID} strokeOpacity={0.2} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v: number | string) => [String(v), "Bookings"]} />
                <Bar dataKey="count" fill={PRIMARY} fillOpacity={0.75} radius={[0, 4, 4, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* 4. Channel split */}
      <ChartCard title="Channel split" subtitle={`Stripe vs Cash/Manual · ${data.label}`}>
        {data.channels.length === 0 ? <Empty /> : (
          <div className="grid sm:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.channels} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {data.channels.map((c) => <Cell key={c.name} fill={CHANNEL_COLORS[c.name] ?? PRIMARY} fillOpacity={0.9} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v: number | string, n: string) => [eur2(Number(v)), n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {data.channels.map((c) => (
                <div key={c.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[c.name] ?? PRIMARY }} />
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="text-sm font-semibold text-foreground">{eur0(c.revenue)}</div>
                    {c.count} booking{c.count !== 1 ? "s" : ""} · avg {eur0(c.avg)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ChartCard>

      {/* 5. Delivery zones */}
      <ChartCard title="Delivery zones" subtitle={`Revenue & bookings by zone · ${data.label}`}>
        {data.zones.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={Math.max(200, data.zones.length * 40)}>
            <BarChart layout="vertical" data={data.zones} margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
              <CartesianGrid stroke={GRID} strokeOpacity={0.2} horizontal={false} />
              <XAxis type="number" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => eur0(Number(v))} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number | string, n: string) => n === "revenue" ? [eur2(Number(v)), "Revenue"] : [String(v), "Bookings"]} />
              <Bar dataKey="revenue" fill={ACCENT} fillOpacity={0.85} radius={[0, 4, 4, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* 6. Operations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Cancellation rate" value={`${(data.ops.cancellationRate * 100).toFixed(0)}%`} subtitle="Cancelled ÷ all bookings" icon={Package} tint="#DC2626" />
        <StatCard title="Repeat customers" value={`${(data.ops.repeatShare * 100).toFixed(0)}%`} subtitle={`${data.ops.repeatCustomers} of ${data.ops.distinctCustomers} customers`} icon={TrendingUp} tint={ACCENT} />
        <StatCard title="Avg rental length" value={`${data.ops.avgRentalLength.toFixed(1)} d`} subtitle="Days per booking" icon={Package} tint={PRIMARY} />
        <StatCard title="Same-day bookings" value={`${(data.ops.sameDayShare * 100).toFixed(0)}%`} subtitle={`${data.ops.sameDay} of ${data.ops.total} start = booked date`} icon={ShoppingCart} tint={SECONDARY} />
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
