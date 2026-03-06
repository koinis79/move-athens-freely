import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CalendarCheck, Activity, Euro, Mail } from "lucide-react";
import { mockBookings } from "@/data/adminMockData";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Today's Bookings", value: "3", icon: CalendarCheck, color: "text-primary" },
  { label: "Active Rentals", value: "7", icon: Activity, color: "text-accent" },
  { label: "Revenue This Month", value: "€2,450", icon: Euro, color: "text-secondary" },
  { label: "Pending Inquiries", value: "2", icon: Mail, color: "text-destructive" },
];

const statusColor: Record<string, string> = {
  Confirmed: "bg-primary/15 text-primary border-primary/30",
  Delivered: "bg-accent/15 text-accent border-accent/30",
  Completed: "bg-muted text-muted-foreground border-border",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const AdminOverview = () => (
  <div className="space-y-8">
    <h1 className="text-2xl font-bold font-heading">Overview</h1>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            <s.icon className={cn("h-5 w-5", s.color)} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-heading">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <div>
      <h2 className="text-lg font-semibold font-heading mb-4">Recent Bookings</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBookings.slice(0, 5).map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.bookingNumber}</TableCell>
                <TableCell>{b.customerName}</TableCell>
                <TableCell>{b.equipment}</TableCell>
                <TableCell>{b.dates}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs", statusColor[b.status])}>
                    {b.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">€{b.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  </div>
);

export default AdminOverview;
