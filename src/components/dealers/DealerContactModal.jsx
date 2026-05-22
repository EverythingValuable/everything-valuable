import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Check, MessageCircle, Package, HelpCircle, Star, Tag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const INQUIRY_TYPES = [
  {
    id: "consign",
    icon: Package,
    label: "Consign an Item",
    description: "I'd like to consign something for sale",
    subject: "Consignment Inquiry",
    placeholder: "Hi, I have an item I'd like to consign. It's a…",
  },
  {
    id: "valuation",
    icon: Tag,
    label: "Request a Valuation",
    description: "I want an estimate for my item",
    subject: "Valuation Request",
    placeholder: "Hi, I'm looking for an appraisal or valuation on…",
  },
  {
    id: "message",
    icon: MessageCircle,
    label: "Send a Message",
    description: "Ask a question or start a conversation",
    subject: "General Question",
    placeholder: "Hi, I wanted to reach out about…",
  },
  {
    id: "feedback",
    icon: Star,
    label: "Other",
    description: "Any other reason to get in touch",
    subject: "Other",
    placeholder: "Hi, I wanted to reach out about…",
  },
];

export default function DealerContactModal({ isOpen, onClose, profile, user }) {
  const [step, setStep] = useState("type"); // "type" | "compose"
  const [selectedType, setSelectedType] = useState(null);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const inquiryType = INQUIRY_TYPES.find(t => t.id === selectedType);

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!body.trim()) return;
      const threadId = `consignment__${profile.user_email}`;
      await base44.entities.Message.create({
        item_id: threadId,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        recipient_email: profile.user_email,
        body: `[${inquiryType.subject}]\n\n${body.trim()}`,
        read: false,
      });
    },
    onSuccess: () => {
      setSent(true);
      setTimeout(() => {
        handleClose();
      }, 2800);
    },
    onError: () => toast({ title: "Failed to send", description: "Please try again.", variant: "destructive" }),
  });

  const handleClose = () => {
    setBody("");
    setSelectedType(null);
    setStep("type");
    setSent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-br from-primary/10 to-secondary overflow-hidden flex-shrink-0">
          {profile?.banner_url && (
            <img src={profile.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-3">
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center shadow">
                <span className="text-primary font-semibold text-base">{(profile?.display_name || "?")[0]}</span>
              </div>
            )}
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{profile?.display_name}</p>
              <p className="text-white/70 text-xs">Get in touch</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {sent ? (
            <div className="py-10 text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                  <Check className="w-7 h-7 text-green-500" />
                </div>
              </div>
              <p className="font-semibold text-foreground">Message sent!</p>
              <p className="text-sm text-muted-foreground">
                {profile?.display_name} will be in touch with you shortly.
              </p>
            </div>
          ) : !user ? (
            <div className="py-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Please sign in to send a message.</p>
              <Button className="w-full" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
                Sign In to Continue
              </Button>
            </div>
          ) : step === "type" ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground mb-3">What can we help you with?</p>
              {INQUIRY_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => { setSelectedType(type.id); setStep("compose"); }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setStep("type")}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                {inquiryType && <inquiryType.icon className="w-4 h-4 text-primary" />}
                <p className="text-sm font-semibold text-foreground">{inquiryType?.label}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Message</label>
                <Textarea
                  placeholder={inquiryType?.placeholder || "Write your message…"}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="h-36 resize-none text-sm"
                  autoFocus
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
        </div>
      </DialogContent>
    </Dialog>
  );
}