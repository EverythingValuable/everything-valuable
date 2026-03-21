import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  User, Building2, Palette, Settings2, TrendingDown, Rocket,
  CheckCircle2, ChevronRight, ChevronLeft, Upload
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Account",    icon: User },
  { id: 2, label: "Identity",   icon: Building2 },
  { id: 3, label: "Profile",    icon: Palette },
  { id: 4, label: "Preferences",icon: Settings2 },
  { id: 5, label: "PRI$OMETER",  icon: TrendingDown },
  { id: 6, label: "Ready",      icon: Rocket },
];

const SELLER_TYPES = [
  { value: "individual", label: "Individual",     desc: "Selling personally-owned items" },
  { value: "gallery",    label: "Gallery",        desc: "Art or object gallery" },
  { value: "dealer",     label: "Dealer",         desc: "Licensed trade dealer" },
  { value: "auction_house", label: "Auction House", desc: "Established auction business" },
  { value: "estate",     label: "Estate",         desc: "Estate or collection liquidation" },
];

const SPECIALTIES = [
  "Fine Art","Jewelry","Watches","Furniture","Decorative Arts",
  "Sculpture","Ceramics","Textiles","Photography","Antiques",
  "Collectibles","Books & Manuscripts","Wine","Design","Luxury Goods"
];

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    // Step 1
    display_name: "", phone: "",
    // Step 2
    seller_type: "", legal_name: "", address_line1: "", city: "", state: "", country: "", tax_id: "",
    // Step 3
    logo_url: "", banner_url: "", bio: "", about: "", specialties: [], website: "", instagram: "",
    // Step 4
    shipping_preferences: "worldwide", return_policy: "no_returns",
    default_first_bids_hours: 72, default_prisometer_hours: 48, default_below_reserve_percent: 10,
  });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const toggleSpecialty = (s) =>
    set("specialties", form.specialties.includes(s)
      ? form.specialties.filter(x => x !== s)
      : [...form.specialties, s]);

  const handleFinish = async () => {
    setSaving(true);
    const user = await base44.auth.me();
    await base44.entities.SellerProfile.create({
      ...form,
      user_email: user.email,
      onboarding_complete: true,
    });
    navigate("/seller");
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg font-semibold">Everything Valuable</span>
          <span className="text-muted-foreground text-sm">· Seller Onboarding</span>
        </div>
        <span className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</span>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-secondary">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Step pills */}
      <div className="flex items-center justify-center gap-2 py-6 flex-wrap px-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              active && "bg-primary text-primary-foreground",
              done && "bg-secondary text-foreground",
              !active && !done && "text-muted-foreground"
            )}>
              {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-2xl">

          {/* STEP 1 */}
          {step === 1 && (
            <StepCard title="Let's set up your account" subtitle="Start with the basics. You can update everything later.">
              <Field label="Full Name">
                <Input placeholder="e.g. Catherine Harlow" value={form.display_name} onChange={e => set("display_name", e.target.value)} />
              </Field>
              <Field label="Phone Number">
                <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => set("phone", e.target.value)} />
              </Field>
            </StepCard>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <StepCard title="Identity & Business" subtitle="This information is kept private and used for verification and payouts.">
              <Field label="Seller Type" required>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SELLER_TYPES.map(t => (
                    <button key={t.value} onClick={() => set("seller_type", t.value)}
                      className={cn(
                        "text-left px-4 py-3 rounded-xl border text-sm transition-all",
                        form.seller_type === t.value
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      )}>
                      <span className="font-medium block text-foreground">{t.label}</span>
                      <span className="text-xs">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Legal / Business Name">
                  <Input placeholder="As it appears on tax documents" value={form.legal_name} onChange={e => set("legal_name", e.target.value)} />
                </Field>
                <Field label="Tax ID / EIN (optional)">
                  <Input placeholder="For payouts" value={form.tax_id} onChange={e => set("tax_id", e.target.value)} />
                </Field>
              </div>
              <Field label="Business Address">
                <Input placeholder="Street address" value={form.address_line1} onChange={e => set("address_line1", e.target.value)} className="mb-2" />
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="City" value={form.city} onChange={e => set("city", e.target.value)} />
                  <Input placeholder="State" value={form.state} onChange={e => set("state", e.target.value)} />
                  <Input placeholder="Country" value={form.country} onChange={e => set("country", e.target.value)} />
                </div>
              </Field>
            </StepCard>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <StepCard title="Your Seller Profile" subtitle="This is what buyers will see. Make it remarkable.">
              <Field label="Profile / Logo Image">
                <ImageUploadBox value={form.logo_url} onChange={v => set("logo_url", v)} label="Upload logo or portrait" aspect="square" />
              </Field>
              <Field label="Banner Image">
                <ImageUploadBox value={form.banner_url} onChange={v => set("banner_url", v)} label="Upload a wide banner image" aspect="banner" />
              </Field>
              <Field label="Short Bio" hint="One or two sentences — appears in search results">
                <Textarea placeholder="A specialist in Post-War European painting, represented across three decades…" value={form.bio} onChange={e => set("bio", e.target.value)} className="h-20" />
              </Field>
              <Field label="Full About Section">
                <Textarea placeholder="Tell your full story — history, expertise, notable sales or provenance…" value={form.about} onChange={e => set("about", e.target.value)} className="h-32" />
              </Field>
              <Field label="Specialties" hint="Select all that apply">
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => (
                    <button key={s} onClick={() => toggleSpecialty(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-xs transition-all",
                        form.specialties.includes(s)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      )}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Website (optional)">
                  <Input placeholder="https://yourgallery.com" value={form.website} onChange={e => set("website", e.target.value)} />
                </Field>
                <Field label="Instagram (optional)">
                  <Input placeholder="@yourhandle" value={form.instagram} onChange={e => set("instagram", e.target.value)} />
                </Field>
              </div>
            </StepCard>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <StepCard title="Selling Preferences" subtitle="Set your defaults. These apply to every new listing but can always be changed.">
              <Field label="Shipping Preference">
                {[
                  ["worldwide", "Ships Worldwide"],
                  ["domestic", "Domestic Only"],
                  ["local_pickup", "Local Pickup"],
                  ["quote_required", "Quote Required"],
                ].map(([val, lbl]) => (
                  <label key={val} className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer mb-2 transition-all",
                    form.shipping_preferences === val ? "border-primary bg-primary/5" : "border-border"
                  )}>
                    <input type="radio" checked={form.shipping_preferences === val}
                      onChange={() => set("shipping_preferences", val)} className="accent-primary" />
                    <span className="text-sm font-medium">{lbl}</span>
                  </label>
                ))}
              </Field>
              <Field label="Return Policy">
                {[
                  ["no_returns", "No Returns"],
                  ["7_days", "7-Day Returns"],
                  ["14_days", "14-Day Returns"],
                  ["30_days", "30-Day Returns"],
                  ["case_by_case", "Case by Case"],
                ].map(([val, lbl]) => (
                  <label key={val} className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer mb-2 transition-all",
                    form.return_policy === val ? "border-primary bg-primary/5" : "border-border"
                  )}>
                    <input type="radio" checked={form.return_policy === val}
                      onChange={() => set("return_policy", val)} className="accent-primary" />
                    <span className="text-sm font-medium">{lbl}</span>
                  </label>
                ))}
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Default 1stBid$ Duration" hint="hours">
                  <Input type="number" value={form.default_first_bids_hours} onChange={e => set("default_first_bids_hours", +e.target.value)} />
                </Field>
                <Field label="Default PRI$OMETER Duration" hint="hours">
                  <Input type="number" value={form.default_prisometer_hours} onChange={e => set("default_prisometer_hours", +e.target.value)} />
                </Field>
                <Field label="Default Reserve Buffer" hint="%">
                  <select value={form.default_below_reserve_percent} onChange={e => set("default_below_reserve_percent", +e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                    <option value={5}>5%</option>
                    <option value={10}>10%</option>
                    <option value={15}>15%</option>
                  </select>
                </Field>
              </div>
            </StepCard>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <StepCard title="Understanding PRI$OMETER™" subtitle="Everything Valuable's proprietary descending-price sales engine.">
              <div className="space-y-4">
                {[
                  ["1stBid$™ Preview Period", "Before the PRI$OMETER activates, buyers can place advance bids during a set preview window. This creates informed, engaged bidders before the clock starts."],
                  ["PRI$OMETER™ Descends Live", "The visible price begins high and descends toward a floor over your chosen time window. The first buyer to claim it — wins it."],
                  ["Hidden Reserve", "Your reserve price is never shown to buyers. Only the visible start price is displayed. The PRI$OMETER drops toward the floor whether or not the reserve is met."],
                  ["Outcomes at Sale", "If the final price is at or above reserve — the item sells immediately. If below — the transaction enters seller review and you decide whether to accept."],
                  ["Make It Mine™", "Any buyer can pause the PRI$OMETER at any moment by paying the service fee upfront, locking in the live price. You can enable or disable this per listing."],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-xl border border-border bg-secondary/30 px-5 py-4">
                    <p className="font-serif text-sm font-semibold mb-1">{title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </StepCard>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <StepCard title="You're ready to list." subtitle="Your seller account is configured. Head to your dashboard to upload your first item.">
              <div className="rounded-2xl border border-primary/30 bg-primary/5 px-6 py-8 text-center space-y-3">
                <Rocket className="w-10 h-10 text-primary mx-auto" />
                <h3 className="font-serif text-2xl font-semibold">Welcome to Everything Valuable</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Your seller studio is ready. Upload your first item, set your PRI$OMETER, and let the market discover what it's worth.
                </p>
              </div>
              <Button onClick={handleFinish} disabled={saving} className="w-full h-12 text-base mt-2">
                {saving ? "Setting up…" : "Go to My Dashboard →"}
              </Button>
            </StepCard>
          )}

          {/* Navigation */}
          {step < 6 && (
            <div className="flex justify-between mt-6">
              {step > 1
                ? <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2"><ChevronLeft className="w-4 h-4" /> Back</Button>
                : <div />}
              <Button onClick={() => setStep(s => s + 1)} className="gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StepCard({ title, subtitle, children }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground flex items-center gap-1">
        {label} {required && <span className="text-destructive">*</span>}
        {hint && <span className="text-xs text-muted-foreground font-normal ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function ImageUploadBox({ value, onChange, label, aspect }) {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
  };
  return (
    <label className={cn(
      "flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30 relative overflow-hidden",
      aspect === "banner" ? "h-32 w-full" : "h-28 w-28"
    )}>
      {value
        ? <img src={value} alt="" className="w-full h-full object-cover" />
        : <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
            <Upload className="w-5 h-5" />
            <span className="text-xs text-center">{label}</span>
          </div>
      }
      <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
    </label>
  );
}