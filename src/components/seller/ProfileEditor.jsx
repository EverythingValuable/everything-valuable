import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Upload, Save, CheckCircle2 } from "lucide-react";

const SPECIALTIES = [
  "Fine Art","Jewelry","Watches","Furniture","Decorative Arts",
  "Sculpture","Ceramics","Textiles","Photography","Antiques",
  "Collectibles","Books & Manuscripts","Wine","Design","Luxury Goods"
];

export default function ProfileEditor() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(null);

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const { data: profile } = useQuery({
    queryKey: ["seller-profile", user?.email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: user?.email }),
    select: d => d[0],
    enabled: !!user?.email,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const DEFAULT_FORM = {
    display_name: "", phone: "", bio: "", about: "", website: "", instagram: "",
    city: "", state: "", country: "", specialties: [], logo_url: "", banner_url: "",
    shipping_preferences: "worldwide", return_policy: "no_returns",
    default_first_bids_hours: 72, default_prisometer_hours: 48, default_below_reserve_percent: 10,
  };

  useEffect(() => {
    if (profile !== undefined) {
      setForm(profile ? {
        display_name: profile.display_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        about: profile.about || "",
        website: profile.website || "",
        instagram: profile.instagram || "",
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        specialties: profile.specialties || [],
        logo_url: profile.logo_url || "",
        banner_url: profile.banner_url || "",
        shipping_preferences: profile.shipping_preferences || "worldwide",
        return_policy: profile.return_policy || "no_returns",
        default_first_bids_hours: profile.default_first_bids_hours || 72,
        default_prisometer_hours: profile.default_prisometer_hours || 48,
        default_below_reserve_percent: profile.default_below_reserve_percent || 10,
      } : DEFAULT_FORM);
    }
  }, [profile]);

  if (!user || form === null) return <div className="p-8 text-sm text-muted-foreground">Loading profile…</div>;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleSpecialty = (s) =>
    set("specialties", form.specialties.includes(s)
      ? form.specialties.filter(x => x !== s)
      : [...form.specialties, s]);

  const handleImageUpload = async (field, file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set(field, file_url);
  };

  const handleSave = async () => {
    setSaving(true);
    if (profile?.id) {
      await base44.entities.SellerProfile.update(profile.id, form);
    } else {
      await base44.entities.SellerProfile.create({ ...form, user_email: user.email });
    }
    queryClient.invalidateQueries({ queryKey: ["seller-profile", user?.email] });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold">My Profile</h2>
          <p className="text-sm text-muted-foreground mt-0.5">This is what buyers see on your seller page.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}</>}
        </Button>
      </div>

      {/* Images */}
      <Section title="Images">
        <div className="flex gap-4 items-start">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Logo / Portrait</label>
            <ImageBox value={form.logo_url} aspect="square" onFile={f => handleImageUpload("logo_url", f)} />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Banner Image</label>
            <ImageBox value={form.banner_url} aspect="banner" onFile={f => handleImageUpload("banner_url", f)} />
          </div>
        </div>
      </Section>

      {/* Basic Info */}
      <Section title="Basic Info">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Display Name">
            <Input value={form.display_name} onChange={e => set("display_name", e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={e => set("phone", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="City">
            <Input value={form.city} onChange={e => set("city", e.target.value)} />
          </Field>
          <Field label="State">
            <Input value={form.state} onChange={e => set("state", e.target.value)} />
          </Field>
          <Field label="Country">
            <Input value={form.country} onChange={e => set("country", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Website">
            <Input placeholder="https://…" value={form.website} onChange={e => set("website", e.target.value)} />
          </Field>
          <Field label="Instagram">
            <Input placeholder="@handle" value={form.instagram} onChange={e => set("instagram", e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* Bio */}
      <Section title="About">
        <Field label="Short Bio" hint="Shown in search results">
          <Textarea className="h-20" value={form.bio} onChange={e => set("bio", e.target.value)} />
        </Field>
        <Field label="Full About Section">
          <Textarea className="h-32" value={form.about} onChange={e => set("about", e.target.value)} />
        </Field>
      </Section>

      {/* Specialties */}
      <Section title="Specialties">
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map(s => (
            <button key={s} onClick={() => toggleSpecialty(s)}
              className={cn("px-3 py-1.5 rounded-full border text-xs transition-all",
                form.specialties.includes(s)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              )}>
              {s}
            </button>
          ))}
        </div>
      </Section>

      {/* Defaults */}
      <Section title="Default Listing Settings">
        <div className="grid grid-cols-3 gap-4">
          <Field label="1stBid$ Duration" hint="hrs">
            <Input type="number" value={form.default_first_bids_hours} onChange={e => set("default_first_bids_hours", +e.target.value)} />
          </Field>
          <Field label="PRI$OMETER Duration" hint="hrs">
            <Input type="number" value={form.default_prisometer_hours} onChange={e => set("default_prisometer_hours", +e.target.value)} />
          </Field>
          <Field label="Reserve Buffer">
            <select value={form.default_below_reserve_percent} onChange={e => set("default_below_reserve_percent", +e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value={5}>5%</option>
              <option value={10}>10%</option>
              <option value={15}>15%</option>
            </select>
          </Field>
        </div>
      </Section>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}</>}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex gap-1">
        {label}
        {hint && <span className="text-xs text-muted-foreground font-normal">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function ImageBox({ value, aspect, onFile }) {
  return (
    <label className={cn(
      "flex items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30 overflow-hidden relative",
      aspect === "banner" ? "h-28 w-full" : "h-24 w-24"
    )}>
      {value
        ? <img src={value} alt="" className="w-full h-full object-cover" />
        : <div className="flex flex-col items-center gap-1 text-muted-foreground p-2">
            <Upload className="w-4 h-4" />
            <span className="text-[10px] text-center">Upload</span>
          </div>
      }
      <input type="file" accept="image/*" className="sr-only" onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
    </label>
  );
}