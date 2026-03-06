import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { mockInquiries } from "@/data/adminMockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const AdminInquiries = () => {
  const { toast } = useToast();
  const [openId, setOpenId] = useState<string | null>(null);

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
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInquiries.map((inq) => (
              <Collapsible key={inq.id} asChild open={openId === inq.id} onOpenChange={(o) => setOpenId(o ? inq.id : null)}>
                <>
                  <CollapsibleTrigger asChild>
                    <TableRow className="cursor-pointer">
                      <TableCell>{inq.date}</TableCell>
                      <TableCell className="font-medium">{inq.name}</TableCell>
                      <TableCell>{inq.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{inq.message}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            inq.status === "New"
                              ? "bg-primary/15 text-primary border-primary/30"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {inq.status}
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
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Full Message</p>
                            <p className="text-sm">{inq.message}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Admin Notes</p>
                            <Textarea
                              defaultValue={inq.adminNotes}
                              rows={2}
                              placeholder="Add internal notes…"
                            />
                          </div>
                          <div className="flex gap-2">
                            {inq.status === "New" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast({ title: "Marked as read" })}
                              >
                                Mark as Read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => toast({ title: "Notes saved" })}
                            >
                              Save Notes
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminInquiries;
