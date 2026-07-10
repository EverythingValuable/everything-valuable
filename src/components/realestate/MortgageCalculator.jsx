import React, { useState, useMemo } from "react";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";

function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function MortgageCalculator({ defaultPrice = 0 }) {
  const [open, setOpen] = useState(false);
  const [homePrice, setHomePrice] = useState(defaultPrice || 500000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.75);
  const [termYears, setTermYears] = useState(30);

  const results = useMemo(() => {
    const down = homePrice * (downPct / 100);
    const principal = homePrice - down;
    const monthlyRate = rate / 100 / 12;
    const n = termYears * 12;
    if (principal <= 0 || monthlyRate <= 0) return null;
    const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - principal;
    return { monthly, down, principal, totalInterest, totalPaid };
  }, [homePrice, downPct, rate, termYears]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Mortgage Calculator</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border">
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Home Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={homePrice}
                  onChange={e => setHomePrice(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 pl-7 pr-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Down Payment</label>
              <div className="relative">
                <input
                  type="number"
                  value={downPct}
                  onChange={e => setDownPct(parseFloat(e.target.value) || 0)}
                  min={0} max={100}
                  className="w-full h-9 pl-3 pr-7 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Interest Rate</label>
              <div className="relative">
                <input
                  type="number"
                  value={rate}
                  onChange={e => setRate(parseFloat(e.target.value) || 0)}
                  step={0.05} min={0.1} max={20}
                  className="w-full h-9 pl-3 pr-7 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Loan Term</label>
              <select
                value={termYears}
                onChange={e => setTermYears(parseInt(e.target.value))}
                className="w-full h-9 px-3 border border-border rounded-lg bg-background text-sm focus:outline-none"
              >
                <option value={10}>10 years</option>
                <option value={15}>15 years</option>
                <option value={20}>20 years</option>
                <option value={30}>30 years</option>
              </select>
            </div>
          </div>

          {results && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Est. Monthly Payment</p>
                <p className="font-price text-3xl font-bold text-primary">{formatCurrency(results.monthly)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-muted-foreground block">Down Payment</span>
                  <span className="font-semibold">{formatCurrency(results.down)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Loan Amount</span>
                  <span className="font-semibold">{formatCurrency(results.principal)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Total Interest</span>
                  <span className="font-semibold">{formatCurrency(results.totalInterest)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Total Cost</span>
                  <span className="font-semibold">{formatCurrency(results.totalPaid)}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">* Estimate only. Does not include taxes, insurance, or HOA fees. Consult a licensed mortgage professional.</p>
        </div>
      )}
    </div>
  );
}