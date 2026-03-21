import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const conditionLabels = {
  excellent: "Excellent", very_good: "Very Good", good: "Good", fair: "Fair", as_is: "As Is",
};

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground group-hover:text-primary transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LotDetails({ item }) {
  const hasDetails = item.condition || item.period || item.dimensions || item.materials || item.origin;

  return (
    <div className="mt-8">
      {/* Description */}
      <Section title="About This Lot" defaultOpen={true}>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {item.description || "No description available."}
        </p>
      </Section>

      {/* Details grid */}
      {hasDetails && (
        <Section title="Lot Details" defaultOpen={true}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            {item.condition && (
              <div>
                <span className="text-muted-foreground text-xs block mb-0.5">Condition</span>
                <span className="font-medium">{conditionLabels[item.condition] || item.condition}</span>
              </div>
            )}
            {item.period && (
              <div>
                <span className="text-muted-foreground text-xs block mb-0.5">Period</span>
                <span className="font-medium">{item.period}</span>
              </div>
            )}
            {item.materials && (
              <div>
                <span className="text-muted-foreground text-xs block mb-0.5">Materials</span>
                <span className="font-medium">{item.materials}</span>
              </div>
            )}
            {item.dimensions && (
              <div>
                <span className="text-muted-foreground text-xs block mb-0.5">Dimensions</span>
                <span className="font-medium">{item.dimensions}</span>
              </div>
            )}
            {item.origin && (
              <div>
                <span className="text-muted-foreground text-xs block mb-0.5">Origin</span>
                <span className="font-medium">{item.origin}</span>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Provenance */}
      {item.provenance && (
        <Section title="Provenance">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.provenance}</p>
        </Section>
      )}

      {/* Condition Report */}
      {item.condition_notes && (
        <Section title="Condition Report">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.condition_notes}</p>
        </Section>
      )}

      {/* Shipping */}
      {item.shipping_notes && (
        <Section title="Shipping & Handling">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.shipping_notes}</p>
        </Section>
      )}
    </div>
  );
}