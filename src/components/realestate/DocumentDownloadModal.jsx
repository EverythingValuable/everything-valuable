import React, { useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function DocumentDownloadModal({ title, documents, onClose }) {
  const [selected, setSelected] = useState({});
  const { toast } = useToast();

  const toggle = (doc) => {
    setSelected(s => ({ ...s, [doc]: !s[doc] }));
  };

  const anySelected = Object.values(selected).some(Boolean);

  const handleDownload = () => {
    const docs = documents.filter(d => selected[d.label]);
    if (!docs.length) return;
    toast({ title: `Requesting ${docs.length} document${docs.length > 1 ? "s" : ""}…`, description: "You will be contacted with access details." });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h2 className="font-serif text-xl font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document list */}
        <div className="px-6 py-4 space-y-1 max-h-[60vh] overflow-y-auto">
          {documents.map((doc) => (
            <label
              key={doc.label}
              className="flex items-start gap-3 py-3 px-3 rounded-lg cursor-pointer hover:bg-secondary/60 transition-colors group"
            >
              <input
                type="checkbox"
                checked={!!selected[doc.label]}
                onChange={() => toggle(doc.label)}
                className="mt-0.5 accent-primary w-4 h-4 shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{doc.label}</p>
                {doc.note && <p className="text-xs text-muted-foreground mt-0.5">{doc.note}</p>}
              </div>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-border">
          <Button
            className="w-full gap-2 h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
            disabled={!anySelected}
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" /> Download Selected Documents
          </Button>
        </div>
      </div>
    </div>
  );
}