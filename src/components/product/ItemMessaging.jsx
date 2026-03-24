import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function ItemMessaging({ item, user }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const bottomRef = useRef(null);

  const isSeller = user?.email === item.seller_email;
  const otherEmail = isSeller ? null : item.seller_email;

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", item.id, user?.email],
    queryFn: () =>
      base44.entities.Message.filter({ item_id: item.id }).then((msgs) =>
        msgs
          .filter(
            (m) =>
              m.sender_email === user.email ||
              m.recipient_email === user.email
          )
          .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      ),
    enabled: !!user?.email && open,
    refetchInterval: open ? 8000 : false,
  });

  // Mark unread messages as read when opened
  useEffect(() => {
    if (!open || !user?.email || messages.length === 0) return;
    messages.forEach((m) => {
      if (!m.read && m.recipient_email === user.email) {
        base44.entities.Message.update(m.id, { read: true });
      }
    });
  }, [open, messages, user?.email]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const unreadCount = messages.filter(
    (m) => !m.read && m.recipient_email === user?.email
  ).length;

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!body.trim()) return;
      const recipient = isSeller
        ? messages.find((m) => m.sender_email !== user.email)?.sender_email
        : otherEmail;
      if (!recipient) throw new Error("No recipient found.");
      await base44.entities.Message.create({
        item_id: item.id,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        recipient_email: recipient,
        body: body.trim(),
        read: false,
      });
    },
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["messages", item.id, user?.email] });
    },
    onError: (err) => toast({ title: "Failed to send", description: err.message, variant: "destructive" }),
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMutation.mutate();
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Message Seller</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Sign in to send a message about this item.</p>
        <Button size="sm" className="w-full" onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
      </div>
    );
  }

  // Seller: only show if they have incoming messages
  if (isSeller && messages.length === 0 && !open) {
    return null;
  }

  const canSend = isSeller
    ? messages.some((m) => m.sender_email !== user.email)
    : !!otherEmail;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {isSeller ? "Messages" : "Message Seller"}
          </span>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border">
          {/* Message thread */}
          <div className="max-h-56 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No messages yet. Ask the seller anything about this item.
              </p>
            ) : (
              messages.map((m) => {
                const isMe = m.sender_email === user.email;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {m.body}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {isMe ? "You" : m.sender_name || m.sender_email} · {format(new Date(m.created_date), "MMM d, h:mm a")}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {canSend && (
            <div className="border-t border-border px-4 py-3 flex gap-2 items-end">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                className="min-h-[60px] resize-none text-sm"
              />
              <Button
                size="icon"
                onClick={() => sendMutation.mutate()}
                disabled={!body.trim() || sendMutation.isPending}
                className="h-10 w-10 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}