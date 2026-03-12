import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name_en: string;
}

interface Equipment {
  id: string;
  name_en: string;
  name_el: string | null;
  slug: string;
  description_en: string | null;
  description_el: string | null;
  price_tier1: number;
  price_tier2: number;
  price_tier3: number;
  price_tier4: number;
  deposit_amount: number;
  quantity_total: number;
  is_active: boolean;
  is_popular: boolean;
  specifications: Record<string, string>;
  category_id: string;
  equipment_categories: { name_en: string } | null;
}

interface EquipmentForm {
  name_en: string;
  name_el: string;
  category_id: string;
  description_en: string;
  description_el: string;
  price_tier1: string;
  price_tier2: string;
  price_tier3: string;
  price_tier4: string;
  deposit_amount: string;
  quantity_total: string;
  is_active: boolean;
  is_popular: boolean;
  specs: { key: string; value: string }[];
}

const emptyForm: EquipmentForm = {
  name_en: "", name_el: "", category_id: "",
  description_en: "", description_el: "",
  price_tier1: "", price_tier2: "", price_tier3: "", price_tier4: "",
  deposit_amount: "0", quantity_total: "1",
  is_active: true, is_popular: false,
  specs: [{ key: "", value: "" }],
};

const AdminEquipment = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<EquipmentForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [{ data: equip }, { data: cats }] = await Promise.all([
      supabase
        .from("equipment")
        .select(`
          id, name_en, name_el, slug, description_en, description_el,
          price_tier1, price_tier2, price_tier3, price_tier4,
          deposit_amount, quantity_total, is_active, is_popular,
          specifications, category_id,
          equipment_categories ( name_en )
        `)
        .order("name_en"),
      supabase
        .from("equipment_categories")
        .select("id, name_en")
        .eq("is_active", true)
        .order("sort_order"),
    ]);
    setItems((equip as Equipment[]) ?? []);
    setCategories((cats as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? "" });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: Equipment) => {
    const specs = Object.entries(item.specifications ?? {}).map(([key, value]) => ({ key, value: String(value) }));
    setForm({
      name_en: item.name_en,
      name_el: item.name_el ?? "",
      category_id: item.category_id,
      description_en: item.description_en ?? "",
      description_el: item.description_el ?? "",
      price_tier1: String(item.price_tier1),
      price_tier2: String(item.price_tier2),
      price_tier3: String(item.price_tier3),
      price_tier4: String(item.price_tier4),
      deposit_amount: String(item.deposit_amount),
      quantity_total: String(item.quantity_total),
      is_active: item.is_active,
      is_popular: item.is_popular,
      specs: specs.length > 0 ? specs : [{ key: "", value: "" }],
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const updateField = (field: keyof EquipmentForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { key: "", value: "" }] }));
  const removeSpec = (i: number) => setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));
  const updateSpec = (i: number, field: "key" | "value", val: string) =>
    setForm((f) => ({ ...f, specs: f.specs.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)) }));

  const handleSave = async () => {
    if (!form.name_en.trim() || !form.category_id) {
      toast({ title: "Name and category are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const specsObj = Object.fromEntries(
      form.specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value.trim()])
    );

    const payload = {
      name_en: form.name_en.trim(),
      name_el: form.name_el.trim() || null,
      category_id: form.category_id,
      description_en: form.description_en.trim() || null,
      description_el: form.description_el.trim() || null,
      price_tier1: parseFloat(form.price_tier1) || 0,
      price_tier2: parseFloat(form.price_tier2) || 0,
      price_tier3: parseFloat(form.price_tier3) || 0,
      price_tier4: parseFloat(form.price_tier4) || 0,
      deposit_amount: parseFloat(form.deposit_amount) || 0,
      quantity_total: parseInt(form.quantity_total) || 1,
      is_active: form.is_active,
      is_popular: form.is_popular,
      specifications: specsObj,
    };

    const { error } = editingId
      ? await supabase.from("equipment").update(payload).eq("id", editingId)
      : await supabase.from("equipment").insert({
          ...payload,
          slug: form.name_en.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        });

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Equipment updated" : "Equipment added" });
      setModalOpen(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">Equipment Inventory</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add New</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>1–3 days</TableHead>
              <TableHead>4–7 days</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name_en}</TableCell>
                    <TableCell>{item.equipment_categories?.name_en ?? "—"}</TableCell>
                    <TableCell>€{Number(item.price_tier1).toFixed(0)}</TableCell>
                    <TableCell>€{Number(item.price_tier2).toFixed(0)}</TableCell>
                    <TableCell>{item.quantity_total}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={item.is_active
                          ? "bg-accent/15 text-accent border-accent/30 text-xs"
                          : "bg-muted text-muted-foreground border-border text-xs"}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add/Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Equipment" : "Add New Equipment"}</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Name (EN) *</label>
                <Input value={form.name_en} onChange={(e) => updateField("name_en", e.target.value)} />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Name (GR)</label>
                <Input value={form.name_el} onChange={(e) => updateField("name_el", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">Category *</label>
              <Select value={form.category_id} onValueChange={(v) => updateField("category_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">Description (EN)</label>
              <Textarea value={form.description_en} onChange={(e) => updateField("description_en", e.target.value)} rows={2} />
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Description (GR)</label>
              <Textarea value={form.description_el} onChange={(e) => updateField("description_el", e.target.value)} rows={2} />
            </div>

            <div>
              <p className="text-muted-foreground mb-2">Pricing (€ per rental period)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">1–3 days</label>
                  <Input type="number" value={form.price_tier1} onChange={(e) => updateField("price_tier1", e.target.value)} />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">4–7 days</label>
                  <Input type="number" value={form.price_tier2} onChange={(e) => updateField("price_tier2", e.target.value)} />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">8–14 days</label>
                  <Input type="number" value={form.price_tier3} onChange={(e) => updateField("price_tier3", e.target.value)} />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">15–30 days</label>
                  <Input type="number" value={form.price_tier4} onChange={(e) => updateField("price_tier4", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Deposit (€)</label>
                <Input type="number" value={form.deposit_amount} onChange={(e) => updateField("deposit_amount", e.target.value)} />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Total Quantity</label>
                <Input type="number" value={form.quantity_total} onChange={(e) => updateField("quantity_total", e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-muted-foreground">Specifications</label>
                <Button variant="ghost" size="sm" onClick={addSpec}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
              </div>
              {form.specs.map((s, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input placeholder="Key" value={s.key} onChange={(e) => updateSpec(i, "key", e.target.value)} className="flex-1" />
                  <Input placeholder="Value" value={s.value} onChange={(e) => updateSpec(i, "value", e.target.value)} className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeSpec(i)}><X className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => updateField("is_active", v)} />
                <span>{form.is_active ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_popular} onCheckedChange={(v) => updateField("is_popular", v)} />
                <span>Popular</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEquipment;
