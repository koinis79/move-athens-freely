import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminBookings from "@/components/admin/AdminBookings";
import AdminEquipment from "@/components/admin/AdminEquipment";
import AdminInquiries from "@/components/admin/AdminInquiries";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-var(--header-height))]">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {activeTab === "overview" && <AdminOverview />}
        {activeTab === "bookings" && <AdminBookings />}
        {activeTab === "equipment" && <AdminEquipment />}
        {activeTab === "inquiries" && <AdminInquiries />}
      </main>
    </div>
  );
};

export default Admin;
