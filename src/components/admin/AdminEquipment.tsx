import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { equipmentItems } from "@/data/equipment";
import { useToast } from "@/hooks/use-toast";

interface EquipmentForm {
  nameEn: string;
  nameGr: string;
  category: string;
  descriptionEn: string;
  descriptionGr: string;
  pricePerDay: string;
  pricePerWeek: string;
  pricePerMonth: string;
  deposit: string;
  quantity: string;
  active: boolean;
  specs: { key: string; value: string }[];
}

const emptyForm: EquipmentForm = {
  nameEn: "", nameGr: "", category: "Wheelchair",
  descriptionEn: "", descriptionGr: "",
  pricePerDay: "", pricePerWeek: "", pricePerMonth: "",
  deposit: "", quantity: "1", active: true, specs: [{ key: "", value: "" }],
};

const categories = ["Wheelchair", "Power Wheelchair", "Mobility Scooter", "Rollator"];

const AdminEquipment = () => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<EquipmentForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    const item = equipmentItems.find((e) => e.id === id);
    if (!item) return;
    setForm({
      nameEn: item.name, nameGr: "", category: item.category,
      descriptionEn: item.description, descriptionGr: "",
      pricePerDay: String(item.pricePerDay), pricePerWeek: String(item.pricePerWeek),
      pricePerMonth: "", deposit: "", quantity: "3", active: true,
      specs: [{ key: "Weight", value: "12 kg" }],
    });
    setEditingId(id);
    setModalOpen(true);
  };

  const updateField = (field: keyof EquipmentForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { key: "", value: "" }] }));
  const removeSpec = (i: number) => setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));
  const updateSpec = (i: number, field: "key" | "value", val: string) =>
    setForm((f) => ({ ...f, specs: f.specs.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)) }));

  const handleSave = () => {
    toast({ title: editingId ? "Equipment updated" : "Equipment added" });
    setModalOpen(false);
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
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Daily</TableHead>
              <TableHead>Weekly</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipmentItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <img src="/placeholder.svg" alt="" className="h-8 w-8 rounded object-cover" />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>€{item.pricePerDay}</TableCell>
                <TableCell>€{item.pricePerWeek}</TableCell>
                <TableCell>3</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30 text-xs">
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item.id)}>
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
                <label className="text-muted-foreground block mb-1">Name (EN)</label>
                <Input value={form.nameEn} onChange={(e) => updateField("nameEn", e.target.value)} />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Name (GR)</label>
                <Input value={form.nameGr} onChange={(e) => updateField("nameGr", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">Category</label>
              <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">Description (EN)</label>
              <Textarea value={form.descriptionEn} onChange={(e) => updateField("descriptionEn", e.target.value)} rows={2} />
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Description (GR)</label>
              <Textarea value={form.descriptionGr} onChange={(e) => updateField("descriptionGr", e.target.value)} rows={2} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Price/Day (€)</label>
                <Input type="number" value={form.pricePerDay} onChange={(e) => updateField("pricePerDay", e.target.value)} />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Price/Week (€)</label>
                <Input type="number" value={form.pricePerWeek} onChange={(e) => updateField("pricePerWeek", e.target.value)} />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Price/Month (€)</label>
                <Input type="number" value={form.pricePerMonth} onChange={(e) => updateField("pricePerMonth", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Deposit (€)</label>
                <Input type="number" value={form.deposit} onChange={(e) => updateField("deposit", e.target.value)} />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Total Quantity</label>
                <Input type="number" value={form.quantity} onChange={(e) => updateField("quantity", e.target.value)} />
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 text-center text-muted-foreground">
              <p className="text-sm">Drag & drop images here, or click to browse</p>
              <p className="text-xs mt-1">PNG, JPG up to 5MB each</p>
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

            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => updateField("active", v)} />
              <span>{form.active ? "Active" : "Inactive"}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEquipment;
