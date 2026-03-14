import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, LayoutGrid, List, Wheelchair, MoreVertical,
  Pencil, History, Wrench, Star, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  inventoryItems,
  type InventoryItem,
  type InventoryStatus,
  type InventoryCategory,
} from "@/data/adminInventoryMockData";

/* ── Status config ── */
const statusConfig: Record<InventoryStatus, { label: string; dotClass: string; badgeClass: string }> = {
  available:   { label: "Available",   dotClass: "bg-emerald-500", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rented:      { label: "Rented",      dotClass: "bg-orange-500",  badgeClass: "bg-orange-100 text-orange-800 border-orange-200" },
  maintenance: { label: "Maintenance", dotClass: "bg-red-500",     badgeClass: "bg-red-100 text-red-800 border-red-200" },
  retired:     { label: "Retired",     dotClass: "bg-gray-400",    badgeClass: "bg-gray-100 text-gray-600 border-gray-200" },
};

const conditionClass: Record<string, string> = {
  Excellent: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Good:      "bg-blue-100 text-blue-800 border-blue-200",
  Fair:      "bg-amber-100 text-amber-800 border-amber-200",
  Poor:      "bg-red-100 text-red-800 border-red-200",
};

const categoryOptions: { label: string; value: string }[] = [
  { label: "All Categories", value: "all" },
  { label: "Wheelchairs", value: "Wheelchairs" },
  { label: "Scooters", value: "Scooters" },
  { label: "Rollators", value: "Rollators" },
  { label: "Accessories", value: "Accessories" },
];

const statusOptions: { label: string; value: string }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Available", value: "available" },
  { label: "Rented", value: "rented" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Retired", value: "retired" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const AdminInventoryPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventoryItems.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q)) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });
  }, [search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  /* ── Grid Card ── */
  const EquipmentCard = ({ item }: { item: InventoryItem }) => {
    const sc = statusConfig[item.status];
    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedItem(item)}
      >
        {/* Photo placeholder */}
        <div className="h-36 bg-muted rounded-t-lg flex items-center justify-center">
          <Wheelchair className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
            <Badge variant="outline" className="text-[10px] shrink-0">{item.category}</Badge>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`h-2 w-2 rounded-full ${sc.dotClass}`} />
            <span className="text-muted-foreground">{sc.label}</span>
            {item.status === "rented" && item.returnDate && (
              <span className="text-muted-foreground ml-auto">Returns {formatDate(item.returnDate)}</span>
            )}
          </div>

          {/* Rate & stats */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">€{item.dailyRate}/day</span>
            <span className="text-muted-foreground">{item.totalRentals} rentals</span>
          </div>

          {/* Condition */}
          <Badge variant="outline" className={`text-[10px] ${conditionClass[item.condition]}`}>
            {item.condition}
          </Badge>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Top bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-heading">Equipment Inventory</h1>
        <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Plus className="h-4 w-4 mr-1.5" /> Add Equipment
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categoryOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="sm"
            className="rounded-none"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            className="rounded-none"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Grid View ── */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
          {paginated.length === 0 && (
            <p className="col-span-full text-center py-12 text-muted-foreground">No equipment found.</p>
          )}
        </div>
      )}

      {/* ── List View ── */}
      {view === "list" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Current Renter</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Rentals</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((item) => {
                const sc = statusConfig[item.status];
                return (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${sc.dotClass}`} />
                        <span className="text-xs">{sc.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>€{item.dailyRate}</TableCell>
                    <TableCell className="text-xs">{item.currentRenter ?? "—"}</TableCell>
                    <TableCell className="text-xs">{item.returnDate ? formatDate(item.returnDate) : "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${conditionClass[item.condition]}`}>
                        {item.condition}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.totalRentals}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreVertical className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedItem(item)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem><History className="h-3.5 w-3.5 mr-2" /> View History</DropdownMenuItem>
                          <DropdownMenuItem><Wrench className="h-3.5 w-3.5 mr-2" /> Set Maintenance</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    No equipment found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>{filtered.length} items</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[72px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 text-xs text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedItem.name}
                <Badge variant="outline" className={statusConfig[selectedItem.status].badgeClass}>
                  {statusConfig[selectedItem.status].label}
                </Badge>
              </DialogTitle>
              <DialogDescription>{selectedItem.id} · {selectedItem.category}</DialogDescription>
            </DialogHeader>

            <div className="space-y-5 text-sm">
              {/* Photo placeholder */}
              <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                <Wheelchair className="h-16 w-16 text-muted-foreground/30" />
                <span className="ml-3 text-muted-foreground text-xs">Photo upload placeholder</span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground">{selectedItem.description}</p>

              {/* Pricing */}
              <div>
                <h4 className="font-semibold mb-2">Pricing</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-lg font-bold">€{selectedItem.dailyRate}</p>
                    <p className="text-[11px] text-muted-foreground">per day</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-lg font-bold">€{selectedItem.weeklyRate}</p>
                    <p className="text-[11px] text-muted-foreground">per week</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-lg font-bold">€{selectedItem.depositAmount}</p>
                    <p className="text-[11px] text-muted-foreground">deposit</p>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-muted-foreground">Condition:</span>{" "}
                  <Badge variant="outline" className={conditionClass[selectedItem.condition]}>
                    {selectedItem.condition}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Rentals:</span>{" "}
                  <span className="font-semibold">{selectedItem.totalRentals}</span>
                </div>
              </div>

              {/* Current renter */}
              {selectedItem.currentRenter && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <p className="font-semibold text-orange-800 text-xs mb-1">Currently Rented</p>
                  <p className="text-sm">{selectedItem.currentRenter}</p>
                  {selectedItem.returnDate && (
                    <p className="text-xs text-muted-foreground">Returns {formatDate(selectedItem.returnDate)}</p>
                  )}
                </div>
              )}

              {/* Maintenance log */}
              <div>
                <h4 className="font-semibold mb-2">Maintenance Log</h4>
                {selectedItem.maintenanceLog.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No maintenance records.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedItem.maintenanceLog.map((entry, i) => (
                      <div key={i} className="flex gap-3 text-xs border-l-2 border-muted pl-3 py-1">
                        <span className="text-muted-foreground shrink-0">{formatDate(entry.date)}</span>
                        <span>{entry.notes}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rental history */}
              <div>
                <h4 className="font-semibold mb-2">Rental History</h4>
                {selectedItem.rentalHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No rental history.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Booking</TableHead>
                        <TableHead className="text-xs">Customer</TableHead>
                        <TableHead className="text-xs">Period</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItem.rentalHistory.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">{r.bookingId}</TableCell>
                          <TableCell className="text-xs">{r.customer}</TableCell>
                          <TableCell className="text-xs">{formatDate(r.start)} – {formatDate(r.end)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Internal notes */}
              <div>
                <h4 className="font-semibold mb-2">Internal Notes</h4>
                <Textarea
                  defaultValue={selectedItem.internalNotes}
                  placeholder="Add internal notes…"
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {selectedItem.status === "available" && (
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Wrench className="h-4 w-4 mr-1.5" /> Set Maintenance
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
              <Button>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AdminInventoryPage;
