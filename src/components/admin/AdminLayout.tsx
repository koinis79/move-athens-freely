import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import AdminBreadcrumbs from "./AdminBreadcrumbs";
import CommandPalette from "./CommandPalette";
import { useState, useCallback, useEffect } from "react";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const handleOpenCommand = useCallback(() => setCommandOpen(true), []);

  // Keyboard shortcuts: D=dashboard, B=bookings, I=inventory, C=calendar, U=customers
  const navigate = useNavigate();
  useEffect(() => {
    const shortcuts: Record<string, string> = {
      d: "/admin",
      b: "/admin/bookings",
      i: "/admin/inventory",
      c: "/admin/calendar",
      u: "/admin/customers",
    };
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea or a modifier key is held
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (shortcuts[key]) {
        e.preventDefault();
        navigate(shortcuts[key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed(!collapsed)}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) setMobileOpen((v) => !v);
            else setCollapsed((v) => !v);
          }}
          onOpenCommand={handleOpenCommand}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <AdminBreadcrumbs />
          <Outlet />
        </main>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
};

export default AdminLayout;
