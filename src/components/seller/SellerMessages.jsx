import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function SellerMessages({ user }) {
  const [selectedThread, setSelectedThread] = useState(null);
  const [reply, setReply] = useState("");
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ["seller-messages", user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email }),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  const { data: sentMessages = [] } = useQuery({
    queryKey: ["seller-sent-messages", user?.email],
    queryFn: () => base44.entities.Message.filter({ sender_email: user.email }),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  const { data: items = [] } = useQuery({
    queryKey: ["seller-items", user?.email],
    queryFn: () => base44.entities.Item.filter({ seller_email: user?.email }),
    enabled: !!user?.email,
  });

  // Build threads grouped by (item_id + buyer_email)
  const combined = [...allMessages, ...sentMessages];
  const threadMap = {};
  combined.forEach((m) => {
    const buyerEmail = m.sender_email === user?.email ? m.recipient_email : m.sender_email;
    const key = `${m.item_id}__${buyerEmail}`;
    if (!threadMap[key]) threadMap[key] = { item_id: m.item_id, buyerEmail, messages: [] };
    if (!threadMap[key].messages.find(x => x.id === m.id)) {
      threadMap[key].messages.push(m);
    }
  });

  const threads = Object.values(threadMap).map(t => {
    const sorted = [...t.messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    const item = items.find(i => i.id === t.item_id);
    const unread = t.messages.filter(m => !m.read && m.recipient_email === user?.email).length;
    return { ...t, messages: sorted, lastMessage: sorted[sorted.length - 1], item, unread };
  }).sort((a, b) => new Date(b.lastMessage?.created_date) - new Date(a.lastMessage?.created_date));

  const activeThread = selectedThread
    ? threads.find(t => t.item_id === selectedThread.item_id && t.buyerEmail === selectedThread.buyerEmail)
    : null;

  // Mark as read when thread opens
  useEffect(() => {
    if (!activeThread) return;
    activeThread.messages.forEach(m => {
      if (!m.read && m.recipient_email === user?.email) {
        base44.entities.Message.update(m.id, { read: true }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["seller-messages", user?.email] });
        });
      }
    });
  }, [activeThread?.messages?.length, selectedThread?.item_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages?.length]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!reply.trim() || !activeThread) return;
      await base44.entities.Message.create({
        item_id: activeThread.item_id,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        recipient_email: activeThread.buyerEmail,
        body: reply.trim(),
        read: false,
      });
    },
    onSuccess: () => {
      setReply("");
      queryClient.invalidateQueries({ queryKey: ["seller-messages", user?.email] });
      queryClient.invalidateQueries({ queryKey: ["seller-sent-messages", user?.email] });
    },
  });

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading messages…</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-semibold">Messages</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalUnread > 0 ? `${totalUnread} unread message${totalUnread !== 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
      </div>

      {threads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center space-y-2">
          <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto" />
          <p className="font-serif text-lg text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground/60">Buyer inquiries about your listings will appear here.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card flex" style={{ height: "520px" }}>
          {/* Thread list */}
          <div className="w-72 border-r border-border flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {threads.map((t) => {
                const isActive = activeThread?.item_id === t.item_id && activeThread?.buyerEmail === t.buyerEmail;
                return (
                  <button
                    key={`${t.item_id}__${t.buyerEmail}`}
                    onClick={() => setSelectedThread({ item_id: t.item_id, buyerEmail: t.buyerEmail })}
                    className={`w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-secondary/40 ${isActive ? "bg-secondary/60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{t.item?.title || "Unknown item"}</p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{t.buyerEmail}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1 italic">{t.lastMessage?.body}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <p className="text-[10px] text-muted-foreground">{format(new Date(t.lastMessage?.created_date), "MMM d")}</p>
                        {t.unread > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4 min-w-4">{t.unread}</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation panel */}
          {activeThread ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="px-5 py-3 border-b border-border bg-secondary/20 shrink-0">
                <p className="text-sm font-medium truncate">{activeThread.item?.title || "Item"}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-muted-foreground">{activeThread.buyerEmail}</p>
                  {activeThread.item && (
                    <Link to={`/item/${activeThread.item_id}`} className="text-[11px] text-primary hover:underline">
                      View listing →
                    </Link>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {activeThread.messages.map((m) => {
                  const isMe = m.sender_email === user.email;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                        {m.body}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {isMe ? "You" : m.sender_name || m.sender_email} · {format(new Date(m.created_date), "MMM d, h:mm a")}
                      </span>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply input */}
              <div className="border-t border-border px-4 py-3 flex gap-2 items-end shrink-0">
                <Textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMutation.mutate(); } }}
                  placeholder="Type a reply…"
                  className="min-h-[60px] resize-none text-sm"
                />
                <Button
                  size="icon"
                  onClick={() => sendMutation.mutate()}
                  disabled={!reply.trim() || sendMutation.isPending}
                  className="h-10 w-10 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/30" />
                <p className="text-sm">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}