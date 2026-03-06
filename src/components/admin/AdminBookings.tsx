import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { mockBookings, bookingStatuses, type MockBooking } from "@/data/adminMockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const statusColor: Record<string, string> = {
  Confirmed: "bg-primary/15 text-primary border-primary/30",
  Preparing: "bg-secondary/15 text-secondary border-secondary/30",
  "Out for Delivery": "bg-secondary/15 text-secondary border-secondary/30",
  Delivered: "bg-accent/15 text-accent border-accent/30",
  "In Use": "bg-accent/15 text-accent border-accent/30",
  "Pickup Scheduled": "bg-secondary/15 text-secondary border-secondary/30",
  "Picked Up": "bg-muted text-muted-foreground border-border",
  Completed: "bg-muted text-muted-foreground border-border",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const AdminBookings = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MockBooking | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const filtered = mockBookings.filter((b) => {
    if (statusFilter !== "All" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.bookingNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openDetail = (b: MockBooking) => {
    setSelected(b);
    setEditStatus(b.status);
    setEditNotes(b.adminNotes);
  };

  const handleSave = () => {
    toast({ title: "Booking updated", description: `Status set to ${editStatus}` });
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">All Bookings</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by booking # or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow
                key={b.id}
                className="cursor-pointer"
                onClick={() => openDetail(b)}
              >
                <TableCell className="font-mono text-xs">{b.bookingNumber}</TableCell>
                <TableCell>{b.customerName}</TableCell>
                <TableCell>{b.equipment}</TableCell>
                <TableCell>{b.dates}</TableCell>
                <TableCell>{b.zone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs", statusColor[b.status])}>
                    {b.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">€{b.amount}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">{selected?.bookingNumber}</DialogTitle>
            <DialogDescription>Booking details and management</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selected.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selected.customerEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selected.customerPhone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-medium">{selected.paymentStatus}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Equipment</p>
                <p className="font-medium">{selected.equipment}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Dates</p>
                <p className="font-medium">{selected.dates}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Delivery Address</p>
                <p className="font-medium">{selected.deliveryAddress}</p>
                {selected.deliveryNotes && (
                  <p className="text-muted-foreground italic mt-1">{selected.deliveryNotes}</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium text-lg">€{selected.amount}</p>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Status</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bookingStatuses.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Admin Notes</label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes…"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
