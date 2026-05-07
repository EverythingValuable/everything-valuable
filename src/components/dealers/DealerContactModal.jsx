import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, Check, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DealerContactModal({ isOpen, onClose, profile, user }) {
  const [subject, setSubject] = useState("Consignment Inquiry");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!body.trim()) return;
      // Use a consignment-specific item_id thread per seller
      const threadId = `consignment__${profile.user_email}`;
      await base44.entities.Message.create({
        item_id: threadId,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        recipient_email: profile.user_email,
        body: `[${subject}]\n\n${body.trim()}`,
        read: false,
      });
    },
    onSuccess: () => {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setBody("");
        setSubject("Consignment Inquiry");
        onClose();
      }, 2500);
    },
    onError: () => toast({ title: "Failed to send", description: "Please try again.", variant: "destructive" }),
  });

  const handleClose = () => {
    setBody("");
    setSubject("Consignment Inquiry");
    setSent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Contact {profile?.display_name}
          </DialogTitle>
          <DialogDescription>
            Send a message to enquire about consigning an item or ask a general question.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-10 text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <Check className="w-7 h-7 text-green-500" />
              </div>
            </div>
            <p className="font-medium text-foreground">Message sent!</p>
            <p className="text-sm text-muted-foreground">
              {profile?.display_name} will be in touch with you shortly.
            </p>
          </div>
        ) : !user ? (
          <div className="py-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Please sign in to send a message.</p>
            <Button className="w-full" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
              Sign In
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option>Consignment Inquiry</option>
                <option>General Question</option>
                <option>Valuation Request</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message</label>
              <Textarea
                placeholder={`Hi ${profile?.display_name}, I'm interested in consigning…`}
                value={body}
                onChange={e => setBody(e.target.value)}
                className="h-32 resize-none text-sm"
              />
            </div>
            <Button
              className="w-full gap-2"
              onClick={() => sendMutation.mutate()}
              disabled={!body.trim() || sendMutation.isPending}
            >
              <Send className="w-4 h-4" />
              {sendMutation.isPending ? "Sending…" : "Send Message"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}