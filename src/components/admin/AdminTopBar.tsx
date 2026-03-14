import { Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

interface AdminTopBarProps {
  onToggleSidebar: () => void;
}

const AdminTopBar = ({ onToggleSidebar }: AdminTopBarProps) => {
  const { user } = useAuth();
  const displayName = user?.email?.split("@")[0] ?? "Admin";

  return (
    <header className="h-14 border-b border-[#E2E4E9] bg-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-md hover:bg-[#F4F5F7] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-[#1B4965]" />
        </button>
        <span className="text-lg font-semibold text-[#1B4965] tracking-tight">
          MoveAbility <span className="font-normal text-[#6B8F71]">Admin</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-1.5 rounded-md hover:bg-[#F4F5F7] transition-colors" aria-label="Notifications">
          <Bell className="h-5 w-5 text-[#4A5568]" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#FF6B35] text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-sm font-medium text-[#4A5568]">{displayName}</span>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#1B4965] text-white text-xs font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
