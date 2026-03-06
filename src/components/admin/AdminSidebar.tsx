import { BarChart3, ClipboardList, Wrench, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "bookings", label: "Bookings", icon: ClipboardList },
  { id: "equipment", label: "Equipment", icon: Wrench },
  { id: "inquiries", label: "Inquiries", icon: Mail },
];

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[250px] flex-col bg-[hsl(220_20%_16%)] text-[hsl(0_0%_95%)] min-h-[calc(100vh-var(--header-height))]">
        <div className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(0_0%_60%)]">
            Admin Panel
          </h2>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary/20 text-primary-foreground"
                  : "text-[hsl(0_0%_70%)] hover:bg-[hsl(220_20%_22%)] hover:text-[hsl(0_0%_90%)]"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden flex border-b border-border bg-card overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
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
    </>
  );
};

export default AdminSidebar;
