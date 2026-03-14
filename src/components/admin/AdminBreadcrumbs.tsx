import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/bookings": "Bookings",
  "/admin/inventory": "Inventory",
  "/admin/calendar": "Calendar",
  "/admin/customers": "Customers",
};

const AdminBreadcrumbs = () => {
  const { pathname } = useLocation();

  if (pathname === "/admin") return null;

  const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  const crumbs: { label: string; path: string }[] = [
    { label: "Dashboard", path: "/admin" },
  ];

  let path = "";
  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`;
    if (path === "/admin") continue;
    crumbs.push({
      label: routeLabels[path] || segments[i].charAt(0).toUpperCase() + segments[i].slice(1),
      path,
    });
  }

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
      <Link to="/admin" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.slice(1).map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {i === crumbs.length - 2 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default AdminBreadcrumbs;
