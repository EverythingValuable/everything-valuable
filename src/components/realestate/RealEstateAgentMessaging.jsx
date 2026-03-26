import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function RealEstateAgentMessaging({ listingId, sellerName }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [showMessaging, setShowMessaging] = useState(false);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ["realestate-messages", listingId],
    queryFn: async () => {
      try {
        const all = await base44.entities.Message.filter({ item_id: listingId });
        return all.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      } catch {
        return [];
      }
    },
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (body) => {
      return base44.entities.Message.create({
        item_id: listingId,
        sender_email: user.email,
        sender_name: user.full_name || "Buyer",
        recipient_email: "listing-agent@example.com",
        body,
      });
    },
    onSuccess: () => {
      setMessage("");
      toast({ title: "Message sent to listing agent" });
    },
    onError: () => {
      toast({ title: "Error sending message", variant: "destructive" });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <MessageCircle className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
        <p className="text-xs text-muted-foreground mb-3">Sign in to message the listing agent</p>
        <Button variant="outline" size="sm" onClick={() => base44.auth.redirectToLogin()}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col max-h-96">
      <button
        onClick={() => setShowMessaging(!showMessaging)}
        className="w-full flex items-center justify-between px-4 py-3 bg-primary/5 hover:bg-primary/10 transition-colors border-b border-border"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Contact {sellerName || "Listing Agent"}</span>
        </div>
        <span className="text-xs text-muted-foreground">{showMessaging ? "−" : "+"}</span>
      </button>

      {showMessaging && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64">
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No messages yet</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_email === user.email ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.sender_email === user.email
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p className="text-xs font-medium mb-1 opacity-75">{msg.sender_name}</p>
                    <p>{msg.body}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
            <input
              type="text"
              placeholder="Ask about the property..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={!message.trim() || sendMutation.isPending}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
}