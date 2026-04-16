import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { ClipboardList, Shield, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import MyBookings from "@/components/dashboard/MyBookings";
import ProfileSettings from "@/components/dashboard/ProfileSettings";

const tabs = [
  { id: "bookings", label: "My Bookings", icon: ClipboardList },
  { id: "profile", label: "Profile Settings", icon: UserCog },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("bookings");
  const { user, isAdmin } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] flex flex-col md:flex-row">
      {/* Mobile tab bar */}
      {isMobile ? (
        <div className="flex border-b bg-card">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      ) : (
        /* Desktop sidebar */
        <aside className="w-[250px] shrink-0 border-r bg-sidebar-background p-4 space-y-1">
          <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-4 px-3">
            Dashboard
          </p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="mt-4 w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </Link>
          )}
        </aside>
      )}

      {/* Content */}
      <main className="flex-1 p-6 md:p-8 max-w-4xl">
        {isAdmin && isMobile && (
          <Link
            to="/admin"
            className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Shield className="h-4 w-4" />
            Open Admin Dashboard
          </Link>
        )}
        {activeTab === "bookings" && <MyBookings />}
        {activeTab === "profile" && <ProfileSettings user={user} />}
      </main>
    </div>
  );
};

export default Dashboard;
