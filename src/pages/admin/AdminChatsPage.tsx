import { Fragment, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at?: string;
}

interface Conversation {
  id: string;
  language: string;
  turn_count: number;
  messages: ChatMessage[];
  is_read: boolean;
  created_at: string;
}

const firstCustomerMessage = (c: Conversation) =>
  c.messages.find((m) => m.role === "user")?.content ?? "";

/** Chatbot transcripts (chat_conversations). RLS is admin-only via is_admin(),
 *  so this page reads and writes with the normal client — no service role. */
const AdminChatsPage = () => {
  const { toast } = useToast();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Conversation | null>(null);

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("id, language, turn_count, messages, is_read, created_at")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setChats(((data ?? []) as unknown as Conversation[]).map((c) => ({
      ...c,
      messages: Array.isArray(c.messages) ? c.messages : [],
    })));
    setLoading(false);
  };

  useEffect(() => { fetchChats(); }, []);

  const markAsRead = async (id: string) => {
    setSaving(id);
    const { error } = await supabase
      .from("chat_conversations")
      .update({ is_read: true })
      .eq("id", id);
    setSaving(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Marked as read" });
      setChats((prev) => prev.map((c) => c.id === id ? { ...c, is_read: true } : c));
    }
  };

  const deleteChat = async (id: string) => {
    setSaving(id + "-delete");
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", id);
    setSaving(null);
    setConfirmDelete(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conversation deleted" });
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (openId === id) setOpenId(null);
    }
  };

  const unread = chats.filter((c) => !c.is_read).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">
        Chats
        {unread > 0 && (
          <Badge variant="outline" className="ml-3 align-middle text-xs bg-primary/15 text-primary border-primary/30">
            {unread} unread
          </Badge>
        )}
      </h1>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Turns</TableHead>
              <TableHead>First message</TableHead>
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
              : chats.map((chat) => (
                  <Fragment key={chat.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => setOpenId(openId === chat.id ? null : chat.id)}
                    >
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(chat.created_at).toLocaleString("en-GB", {
                          timeZone: "Europe/Athens", dateStyle: "short", timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell className="uppercase text-xs">{chat.language === "gr" ? "EL" : chat.language}</TableCell>
                      <TableCell>{chat.turn_count}</TableCell>
                      <TableCell className="max-w-[320px] truncate">{firstCustomerMessage(chat)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            !chat.is_read
                              ? "bg-primary/15 text-primary border-primary/30"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {chat.is_read ? "Read" : "New"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", openId === chat.id && "rotate-180")} />
                      </TableCell>
                    </TableRow>
                    {openId === chat.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <div className="space-y-3 py-2">
                            <div className="space-y-2">
                              {chat.messages.map((m, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words max-w-[85%]",
                                    m.role === "user"
                                      ? "bg-primary/10 ml-auto"
                                      : "bg-background border"
                                  )}
                                >
                                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                                    {m.role === "user" ? "Customer" : "Assistant"}
                                    {m.at && ` · ${new Date(m.at).toLocaleTimeString("en-GB", { timeZone: "Europe/Athens", timeStyle: "short" })}`}
                                  </p>
                                  {m.content || <span className="italic text-muted-foreground">(empty)</span>}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              {!chat.is_read && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={saving === chat.id}
                                  onClick={() => markAsRead(chat.id)}
                                >
                                  {saving === chat.id ? "Saving…" : "Mark as Read"}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={saving === chat.id + "-delete"}
                                onClick={() => setConfirmDelete(chat)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
            {!loading && chats.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No conversations yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              The full transcript is permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && deleteChat(confirmDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminChatsPage;
