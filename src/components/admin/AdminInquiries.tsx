import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  admin_notes: string | null;
  created_at: string;
}

const AdminInquiries = () => {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchInquiries = async () => {
    const { data } = await supabase
      .from("contact_inquiries")
      .select("id, name, email, phone, subject, message, is_read, admin_notes, created_at")
      .order("created_at", { ascending: false });
    const items = (data as Inquiry[]) ?? [];
    setInquiries(items);
    const noteMap: Record<string, string> = {};
    items.forEach((i) => { noteMap[i.id] = i.admin_notes ?? ""; });
    setNotes(noteMap);
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, []);

  const markAsRead = async (id: string) => {
    setSaving(id);
    const { error } = await supabase
      .from("contact_inquiries")
      .update({ is_read: true })
      .eq("id", id);
    setSaving(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Marked as read" });
      setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, is_read: true } : i));
    }
  };

  const saveNotes = async (id: string) => {
    setSaving(id + "-notes");
    const { error } = await supabase
      .from("contact_inquiries")
      .update({ admin_notes: notes[id] ?? "" })
      .eq("id", id);
    setSaving(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Notes saved" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Contact Inquiries</h1>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : inquiries.map((inq) => (
                  <Collapsible
                    key={inq.id}
                    asChild
                    open={openId === inq.id}
                    onOpenChange={(o) => setOpenId(o ? inq.id : null)}
                  >
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow className="cursor-pointer">
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(inq.created_at).toLocaleDateString("en-GB")}
                          </TableCell>
                          <TableCell className="font-medium">{inq.name}</TableCell>
                          <TableCell>{inq.email}</TableCell>
                          <TableCell className="max-w-[160px] truncate">
                            {inq.subject ?? inq.message.slice(0, 40)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                !inq.is_read
                                  ? "bg-primary/15 text-primary border-primary/30"
                                  : "bg-muted text-muted-foreground border-border"
                              )}
                            >
                              {inq.is_read ? "Read" : "New"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", openId === inq.id && "rotate-180")} />
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30">
                            <div className="space-y-3 py-2">
                              {inq.phone && (
                                <p className="text-sm"><span className="text-muted-foreground">Phone: </span>{inq.phone}</p>
                              )}
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Message</p>
                                <p className="text-sm">{inq.message}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Admin Notes</p>
                                <Textarea
                                  value={notes[inq.id] ?? ""}
                                  onChange={(e) => setNotes((prev) => ({ ...prev, [inq.id]: e.target.value }))}
                                  rows={2}
                                  placeholder="Add internal notes…"
                                />
                              </div>
                              <div className="flex gap-2">
                                {!inq.is_read && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={saving === inq.id}
                                    onClick={() => markAsRead(inq.id)}
                                  >
                                    {saving === inq.id ? "Saving…" : "Mark as Read"}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  disabled={saving === inq.id + "-notes"}
                                  onClick={() => saveNotes(inq.id)}
                                >
                                  {saving === inq.id + "-notes" ? "Saving…" : "Save Notes"}
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))}
            {!loading && inquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No inquiries yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminInquiries;
