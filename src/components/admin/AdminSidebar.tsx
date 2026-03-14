import {
  LayoutDashboard, ClipboardList, Package, CalendarDays, Users, ChevronLeft, X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/admin/inventory", label: "Inventory", icon: Package },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/admin/customers", label: "Customers", icon: Users },
];

const AdminSidebar = ({ collapsed, mobileOpen, onToggle, onMobileClose }: AdminSidebarProps) => {
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
              Move<span className="text-secondary">Ability</span>
            </span>
          )}
          {collapsed && <span className="text-lg font-bold text-secondary">M</span>}
        </div>

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
                    ? "bg-secondary text-secondary-foreground shadow-md"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

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
            Move<span className="text-secondary">Ability</span>
          </span>
          <button onClick={onMobileClose} className="p-1 rounded-md hover:bg-white/10">
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onMobileClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground shadow-md"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
