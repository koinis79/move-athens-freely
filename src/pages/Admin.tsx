import { Activity, Truck, Clock, Euro, ArrowUpRight, ArrowDownRight, MapPin, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  mockBookings,
  todaySchedule,
  upcomingPickups,
  dashboardStats,
  type BookingStatus,
} from "@/data/adminDashboardMockData";
import { Link } from "react-router-dom";

/* ── Status badge config ── */
const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800 border-blue-200" },
  delivered: { label: "Delivered", className: "bg-orange-100 text-orange-800 border-orange-200" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
};

/* ── Stat Card ── */
interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
}

const StatCard = ({ title, value, change, icon: Icon, accentColor, accentBg }: StatCardProps) => {
  const positive = change >= 0;
  return (
    <Card className="border border-[#E2E4E9] shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#718096]">{title}</p>
            <p className="text-3xl font-bold text-[#1A202C] tracking-tight">{value}</p>
            <div className={`inline-flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-600" : "text-red-500"}`}>
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change)}% vs yesterday
            </div>
          </div>
          <div className={`rounded-xl p-3 ${accentBg}`}>
            <Icon className={`h-5 w-5 ${accentColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/* ── Date formatter ── */
const fmtDate = (dateStr: string) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const fmtDateFull = (dateStr: string) => {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
};

/* ── Main Dashboard ── */
const AdminDashboard = () => {
  const recentBookings = [...mockBookings]
    .sort((a, b) => b.bookingId.localeCompare(a.bookingId))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A202C]">Dashboard</h1>
        <p className="text-sm text-[#718096] mt-1">Welcome back — here's what's happening today.</p>
      </div>

      {/* ── Top Row: Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Active Rentals"
          value={String(dashboardStats.activeRentals.value)}
          change={dashboardStats.activeRentals.change}
          icon={Activity}
          accentColor="text-[#1B4965]"
          accentBg="bg-[#1B4965]/10"
        />
        <StatCard
          title="Today's Deliveries"
          value={String(dashboardStats.todaysDeliveries.value)}
          change={dashboardStats.todaysDeliveries.change}
          icon={Truck}
          accentColor="text-[#FF6B35]"
          accentBg="bg-[#FF6B35]/10"
        />
        <StatCard
          title="Pending Requests"
          value={String(dashboardStats.pendingRequests.value)}
          change={dashboardStats.pendingRequests.change}
          icon={Clock}
          accentColor="text-amber-600"
          accentBg="bg-amber-50"
        />
        <StatCard
          title="Today's Revenue"
          value={`€${dashboardStats.todaysRevenue.value.toLocaleString()}`}
          change={dashboardStats.todaysRevenue.change}
          icon={Euro}
          accentColor="text-[#6B8F71]"
          accentBg="bg-[#6B8F71]/10"
        />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Recent Bookings — 3/5 width on xl */}
        <Card className="xl:col-span-3 border border-[#E2E4E9] shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#1A202C]">Recent Bookings</CardTitle>
              <Link
                to="/admin/bookings"
                className="text-xs font-medium text-[#1B4965] hover:underline flex items-center gap-0.5"
              >
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E4E9] bg-[#F9FAFB]">
                    <th className="text-left px-4 py-2.5 font-medium text-[#718096] whitespace-nowrap">Booking ID</th>
                    <th className="text-left px-4 py-2.5 font-medium text-[#718096] whitespace-nowrap">Customer</th>
                    <th className="text-left px-4 py-2.5 font-medium text-[#718096] whitespace-nowrap hidden md:table-cell">Equipment</th>
                    <th className="text-left px-4 py-2.5 font-medium text-[#718096] whitespace-nowrap hidden lg:table-cell">Dates</th>
                    <th className="text-left px-4 py-2.5 font-medium text-[#718096] whitespace-nowrap">Status</th>
                    <th className="text-right px-4 py-2.5 font-medium text-[#718096] whitespace-nowrap">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => {
                    const sc = statusConfig[b.status];
                    return (
                      <tr
                        key={b.id}
                        className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-[#1B4965] font-semibold whitespace-nowrap">
                          {b.bookingId}
                        </td>
                        <td className="px-4 py-3 text-[#1A202C] font-medium whitespace-nowrap">{b.customerName}</td>
                        <td className="px-4 py-3 text-[#4A5568] whitespace-nowrap hidden md:table-cell">{b.equipment}</td>
                        <td className="px-4 py-3 text-[#718096] whitespace-nowrap hidden lg:table-cell">
                          {fmtDate(b.startDate)} – {fmtDate(b.endDate)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[11px] font-semibold border ${sc.className}`}>
                            {sc.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1A202C] whitespace-nowrap">
                          €{b.amount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule — 2/5 width on xl */}
        <Card className="xl:col-span-2 border border-[#E2E4E9] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#1A202C]">Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="relative space-y-0">
              {todaySchedule.map((evt, i) => {
                const isDelivery = evt.type === "delivery";
                const dotColor = isDelivery ? "bg-[#FF6B35]" : "bg-[#1B4965]";
                const labelColor = isDelivery ? "text-[#FF6B35]" : "text-[#1B4965]";
                const bgColor = isDelivery ? "bg-[#FF6B35]/5" : "bg-[#1B4965]/5";
                return (
                  <div key={evt.id} className="relative flex gap-3">
                    {/* timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dotColor} shrink-0 ring-2 ring-white`} />
                      {i < todaySchedule.length - 1 && (
                        <div className="w-px flex-1 bg-[#E2E4E9] min-h-[20px]" />
                      )}
                    </div>
                    <div className={`flex-1 rounded-lg p-3 mb-2 ${bgColor}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#1A202C]">{evt.time}</span>
                        <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider border-0 ${labelColor} ${bgColor}`}>
                          {evt.type}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-[#1A202C]">{evt.customerName}</p>
                      <p className="text-xs text-[#718096]">{evt.equipment}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-[#A0AEC0]" />
                        <span className="text-xs text-[#A0AEC0]">{evt.address}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row: Upcoming Pickups ── */}
      <Card className="border border-[#E2E4E9] shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#1A202C]">Upcoming Pickups — Next 3 Days</CardTitle>
            <Badge variant="outline" className="text-xs font-medium border-[#E2E4E9] text-[#718096]">
              {upcomingPickups.length} returns
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E4E9] bg-[#F9FAFB]">
                  <th className="text-left px-4 py-2.5 font-medium text-[#718096]">Customer</th>
                  <th className="text-left px-4 py-2.5 font-medium text-[#718096]">Equipment</th>
                  <th className="text-left px-4 py-2.5 font-medium text-[#718096]">Return Date</th>
                  <th className="text-left px-4 py-2.5 font-medium text-[#718096] hidden sm:table-cell">Hotel</th>
                </tr>
              </thead>
              <tbody>
                {upcomingPickups.map((p) => (
                  <tr key={p.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A202C]">{p.customerName}</td>
                    <td className="px-4 py-3 text-[#4A5568]">{p.equipment}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#A0AEC0]" />
                        <span className="text-[#1A202C] font-medium">{fmtDateFull(p.returnDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#718096] hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#A0AEC0]" />
                        {p.hotel}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
