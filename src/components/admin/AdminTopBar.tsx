import { Menu, Command } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import { useEffect } from "react";

interface AdminTopBarProps {
  onToggleSidebar: () => void;
  onOpenCommand: () => void;
}

const AdminTopBar = ({ onToggleSidebar, onOpenCommand }: AdminTopBarProps) => {
  const { user } = useAuth();
  const displayName = user?.email?.split("@")[0] ?? "Admin";

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenCommand();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenCommand]);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-lg font-semibold text-foreground tracking-tight">
          Movability <span className="font-normal text-accent">Admin</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Command palette hint */}
        <button
          onClick={onOpenCommand}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-xs text-muted-foreground transition-colors"
        >
          <Command className="h-3 w-3" />
          <span>Search…</span>
          <kbd className="ml-2 h-5 px-1.5 inline-flex items-center rounded border border-border bg-card text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>

        <NotificationDropdown />

        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-sm font-medium text-muted-foreground">{displayName}</span>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
