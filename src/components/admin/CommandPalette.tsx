import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, ClipboardList, Package, Users, Plus, Search, Command,
} from "lucide-react";
import {
  Dialog, DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Action {
  id: string;
  label: string;
  icon: React.ElementType;
  keywords: string;
  action: "navigate" | "callback";
  target: string;
}

const actions: Action[] = [
  { id: "new-booking", label: "New Booking", icon: Plus, keywords: "create add booking reservation", action: "navigate", target: "/admin/bookings?new=1" },
  { id: "search-bookings", label: "Search Bookings", icon: ClipboardList, keywords: "find booking reservation", action: "navigate", target: "/admin/bookings" },
  { id: "view-calendar", label: "View Calendar", icon: CalendarDays, keywords: "calendar schedule", action: "navigate", target: "/admin/calendar" },
  { id: "search-customers", label: "Search Customers", icon: Users, keywords: "find customer client", action: "navigate", target: "/admin/customers" },
  { id: "add-equipment", label: "Add Equipment", icon: Package, keywords: "create add equipment inventory", action: "navigate", target: "/admin/inventory" },
  { id: "dashboard", label: "Go to Dashboard", icon: Search, keywords: "home overview dashboard", action: "navigate", target: "/admin" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const CommandPalette = ({ open, onOpenChange }: Props) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filtered = query
    ? actions.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.keywords.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const runAction = useCallback(
    (action: Action) => {
      onOpenChange(false);
      if (action.action === "navigate") {
        navigate(action.target);
      }
    },
    [navigate, onOpenChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      runAction(filtered[selectedIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Type a command or search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 shadow-none focus-visible:ring-0 h-12 text-sm"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 px-1.5 items-center rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No results found.</p>
          ) : (
            filtered.map((action, i) => (
              <button
                key={action.id}
                onClick={() => runAction(action)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  i === selectedIndex
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                <action.icon className="h-4 w-4 shrink-0" />
                <span className="font-medium">{action.label}</span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
