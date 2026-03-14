import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import AdminBreadcrumbs from "./AdminBreadcrumbs";
import CommandPalette from "./CommandPalette";
import { useState, useCallback } from "react";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const handleOpenCommand = useCallback(() => setCommandOpen(true), []);

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
