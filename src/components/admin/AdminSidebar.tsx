import { LayoutDashboard, ClipboardList, Package, CalendarDays, Users, ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/inventory", label: "Inventory", icon: Package },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/admin/customers", label: "Customers", icon: Users },
];

const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-[#0D2137] text-white shrink-0 transition-all duration-300 relative",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo area */}
      <div className={cn("h-14 flex items-center border-b border-white/10 px-4", collapsed && "justify-center")}>
        {!collapsed && (
          <span className="text-base font-bold tracking-tight whitespace-nowrap">
            Move<span className="text-[#FF6B35]">Ability</span>
          </span>
        )}
        {collapsed && <span className="text-lg font-bold text-[#FF6B35]">M</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-[#FF6B35] text-white shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="hidden lg:flex items-center justify-center h-10 border-t border-white/10 hover:bg-white/10 transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft className={cn("h-4 w-4 text-white/60 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
};

export default AdminSidebar;
