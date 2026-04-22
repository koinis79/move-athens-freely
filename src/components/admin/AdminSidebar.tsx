import { useEffect, useState } from "react";
import {
  LayoutDashboard, ClipboardList, Package, CalendarDays, Users, ChevronLeft, X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  end?: boolean;
  badgeKey?: "pending" | "today";
}

const navItems: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, shortcut: "D" },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList, shortcut: "B", badgeKey: "pending" },
  { to: "/admin/inventory", label: "Inventory", icon: Package, shortcut: "I" },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarDays, shortcut: "C" },
  { to: "/admin/customers", label: "Customers", icon: Users, shortcut: "U" },
];

interface Stats {
  pending: number;
  today: number;
}

const AdminSidebar = ({ collapsed, mobileOpen, onToggle, onMobileClose }: AdminSidebarProps) => {
  const [stats, setStats] = useState<Stats>({ pending: 0, today: 0 });

  useEffect(() => {
    async function loadStats() {
      const today = new Date().toISOString().slice(0, 10);
      const [pendingRes, todayRes] = await Promise.all([
        supabase.from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending")
          .eq("is_archived", false),
        supabase.from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("rental_start", today)
          .eq("is_archived", false),
      ]);
      setStats({
        pending: pendingRes.count ?? 0,
        today: todayRes.count ?? 0,
      });
    }
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderNav = (mobile = false) => (
    <nav className="flex-1 py-4 space-y-1 px-2">
      {navItems.map((item) => {
        const badgeCount = item.badgeKey ? stats[item.badgeKey] : 0;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={mobile ? onMobileClose : undefined}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                !mobile && collapsed && "justify-center px-2",
                isActive
                  ? "bg-secondary text-secondary-foreground shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {(mobile || !collapsed) && (
              <>
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
                {item.shortcut && (
                  <kbd className="ml-1 hidden group-hover:inline-flex h-4 px-1 items-center rounded border border-white/20 bg-white/5 text-[9px] font-mono text-white/60">
                    {item.shortcut}
                  </kbd>
                )}
              </>
            )}
            {!mobile && collapsed && badgeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  const renderStats = (mobile = false) => {
    if (!mobile && collapsed) return null;
    return (
      <div className="mx-2 mt-1 mb-3 rounded-lg border border-white/10 bg-white/5 p-3">
        <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-2">
          Quick Stats
        </p>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-white">{stats.pending}</p>
            <p className="text-[10px] text-white/60">Pending</p>
          </div>
          <div>
            <p className="text-xl font-bold text-secondary">{stats.today}</p>
            <p className="text-[10px] text-white/60">Today</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-[#0D2137] text-white shrink-0 transition-all duration-300 relative",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        <div className={cn("h-14 flex items-center border-b border-white/10 px-4", collapsed && "justify-center")}>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight whitespace-nowrap">
              Mov<span className="text-secondary">Ability</span>
            </span>
          )}
          {collapsed && <span className="text-lg font-bold text-secondary">M</span>}
        </div>

        {renderStats()}
        {renderNav()}

        {!collapsed && (
          <div className="px-4 pb-2 text-[10px] text-white/40 border-t border-white/10 pt-2">
            Press letter keys to navigate · <kbd className="px-1 rounded bg-white/10">?</kbd> for help
          </div>
        )}

        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center h-10 border-t border-white/10 hover:bg-white/10 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("h-4 w-4 text-white/60 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0D2137] text-white flex flex-col transform transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 flex items-center justify-between border-b border-white/10 px-4">
          <span className="text-base font-bold tracking-tight whitespace-nowrap">
            Mov<span className="text-secondary">Ability</span>
          </span>
          <button onClick={onMobileClose} className="p-1 rounded-md hover:bg-white/10">
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        {renderStats(true)}
        {renderNav(true)}
      </aside>
    </>
  );
};

export default AdminSidebar;
