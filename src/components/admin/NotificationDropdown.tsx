import { useState, useRef, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  link: string;
}

const now = new Date();
const minsAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

const initialNotifications: Notification[] = [
  { id: "n1", message: "New booking request from James O'Brien", timestamp: minsAgo(8), read: false, link: "/admin/bookings" },
  { id: "n2", message: "Pickup due tomorrow: Wheelchair — Hotel Grande Bretagne", timestamp: minsAgo(25), read: false, link: "/admin/calendar" },
  { id: "n3", message: "Equipment EQ-005 maintenance reminder", timestamp: minsAgo(47), read: false, link: "/admin/inventory" },
  { id: "n4", message: "Booking MOV confirmed — Sophie Martin", timestamp: minsAgo(90), read: true, link: "/admin/bookings" },
  { id: "n5", message: "New customer registered: Pierre Dupont", timestamp: minsAgo(180), read: true, link: "/admin/customers" },
  { id: "n6", message: "Robert Johnson requested a Power Wheelchair", timestamp: minsAgo(300), read: true, link: "/admin/bookings" },
];

function timeAgo(ts: string) {
  const diff = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleClick = (n: Notification) => {
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    setOpen(false);
    navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-md hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3 items-start",
                  !n.read && "bg-primary/5",
                )}
              >
                <div className="mt-1.5 shrink-0">
                  {!n.read ? (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  ) : (
                    <div className="w-2 h-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm leading-snug", !n.read ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {n.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.timestamp)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
