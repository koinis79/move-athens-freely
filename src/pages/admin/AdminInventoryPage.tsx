import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Search, Plus, LayoutGrid, List, Armchair, MoreVertical,
  Pencil, Wrench, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAdminEquipment, type AdminEquipmentItem } from "@/hooks/useAdminEquipment";

/* ── Status config ── */
const statusConfig: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  available:    { label: "Available",    dotClass: "bg-emerald-500", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rented:       { label: "Rented",       dotClass: "bg-orange-500",  badgeClass: "bg-orange-100 text-orange-800 border-orange-200" },
  maintenance:  { label: "Maintenance",  dotClass: "bg-red-500",     badgeClass: "bg-red-100 text-red-800 border-red-200" },
  unavailable:  { label: "Unavailable",  dotClass: "bg-gray-400",    badgeClass: "bg-gray-100 text-gray-600 border-gray-200" },
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const AdminInventoryPage = () => {
  const { equipment, loading, updateEquipmentAvailability } = useAdminEquipment();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<AdminEquipmentItem | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get unique categories from data
  const categories = useMemo(() => {
    const cats = new Set(equipment.map((e) => e.equipment_categories?.name_en).filter(Boolean));
    return Array.from(cats) as string[];
  }, [equipment]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return equipment.filter((item) => {
      if (q && !item.name_en.toLowerCase().includes(q) && !item.slug.toLowerCase().includes(q)) return false;
      if (categoryFilter !== "all" && item.equipment_categories?.name_en !== categoryFilter) return false;
      if (statusFilter !== "all" && item.availability !== statusFilter) return false;
      return true;
    });
  }, [search, categoryFilter, statusFilter, equipment]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const EquipmentCard = ({ item }: { item: AdminEquipmentItem }) => {
    const sc = statusConfig[item.availability] ?? statusConfig.available;
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedItem(item)}>
        <div className="h-36 bg-muted rounded-t-lg flex items-center justify-center">
          {item.images?.[0] ? (
            <img src={item.images[0]} alt={item.name_en} className="h-full w-full object-cover rounded-t-lg" />
          ) : (
            <Armchair className="h-12 w-12 text-muted-foreground/40" />
          )}
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight">{item.name_en}</h3>
            <Badge variant="outline" className="text-[10px] shrink-0">{item.equipment_categories?.name_en ?? "—"}</Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`h-2 w-2 rounded-full ${sc.dotClass}`} />
            <span className="text-muted-foreground">{sc.label}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">€{item.price_tier1}/day</span>
            <span className="text-muted-foreground">Qty: {item.quantity_total}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-36 rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-heading">Equipment Inventory</h1>
        <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Plus className="h-4 w-4 mr-1.5" /> Add Equipment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="rented">Rented</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-md overflow-hidden">
          <Button variant={view === "grid" ? "default" : "ghost"} size="sm" className="rounded-none" onClick={() => setView("grid")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === "list" ? "default" : "ghost"} size="sm" className="rounded-none" onClick={() => setView("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((item) => <EquipmentCard key={item.id} item={item} />)}
          {paginated.length === 0 && <p className="col-span-full text-center py-12 text-muted-foreground">No equipment found.</p>}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((item) => {
                const sc = statusConfig[item.availability] ?? statusConfig.available;
                return (
                  <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                    <TableCell className="font-medium">{item.name_en}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{item.equipment_categories?.name_en ?? "—"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${sc.dotClass}`} />
                        <span className="text-xs">{sc.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>€{item.price_tier1}</TableCell>
                    <TableCell>{item.quantity_total}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreVertical className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedItem(item)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateEquipmentAvailability(item.id, "maintenance")}>
                            <Wrench className="h-3.5 w-3.5 mr-2" /> Set Maintenance
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No equipment found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
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

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedItem.name_en}
                <Badge variant="outline" className={(statusConfig[selectedItem.availability] ?? statusConfig.available).badgeClass}>
                  {(statusConfig[selectedItem.availability] ?? statusConfig.available).label}
                </Badge>
              </DialogTitle>
              <DialogDescription>{selectedItem.slug} · {selectedItem.equipment_categories?.name_en ?? "—"}</DialogDescription>
            </DialogHeader>

            <div className="space-y-5 text-sm">
              {selectedItem.images?.[0] ? (
                <img src={selectedItem.images[0]} alt={selectedItem.name_en} className="h-40 w-full object-cover rounded-lg" />
              ) : (
                <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                  <Armchair className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}

              {selectedItem.description_en && <p className="text-muted-foreground">{selectedItem.description_en}</p>}

              <div>
                <h4 className="font-semibold mb-2">Pricing Tiers</h4>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "1-3 days", price: selectedItem.price_tier1 },
                    { label: "4-7 days", price: selectedItem.price_tier2 },
                    { label: "8-14 days", price: selectedItem.price_tier3 },
                    { label: "15+ days", price: selectedItem.price_tier4 },
                  ].map((t) => (
                    <div key={t.label} className="rounded-lg border p-3 text-center">
                      <p className="text-lg font-bold">€{t.price}</p>
                      <p className="text-[11px] text-muted-foreground">{t.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div><span className="text-muted-foreground">Deposit:</span> <span className="font-semibold">€{selectedItem.deposit_amount}</span></div>
                <div><span className="text-muted-foreground">Total Qty:</span> <span className="font-semibold">{selectedItem.quantity_total}</span></div>
                {selectedItem.is_popular && <Badge className="bg-secondary/10 text-secondary border-secondary/30">Popular</Badge>}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AdminInventoryPage;
