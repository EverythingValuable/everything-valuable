import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Camera, FileText, AlignLeft, TrendingDown, CheckCircle2,
  ChevronLeft, ChevronRight, Upload, X,
  Info, Save, Calendar, Rocket, GripVertical, Lock, AlertTriangle, XCircle
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CategoryFields from "../components/listing/CategoryFields";
import { MAIN_CATEGORIES } from "@/lib/categoryConfig";

const LIVE_STATUSES = ["first_bids", "prisometer", "pending_review"];
const UNSOLD_STATUS = "unsold";

const STEPS = [
  { id: 1, label: "Media",       icon: Camera },
  { id: 2, label: "Details",     icon: FileText },
  { id: 3, label: "Description", icon: AlignLeft },
  { id: 4, label: "Sales Setup", icon: TrendingDown },
  { id: 5, label: "Review",      icon: CheckCircle2 },
];

const CONDITIONS = ["excellent","very_good","good","fair","as_is"];

export default function ListingStudio() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");
  const isEditMode = !!editId;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [itemStatus, setItemStatus] = useState("draft");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const isLive = LIVE_STATUSES.includes(itemStatus);
  const isUnsold = itemStatus === UNSOLD_STATUS;
  // In live edit mode only steps 1 (photos), 3 (description), and 5 (review) are accessible
  const liveAllowedSteps = [1, 3, 5];
  const [form, setForm] = useState({
    images: [],
    title: "", category: "", subcategory: "", maker: "",
    period: "", style: "", technique: "", keywords: "",
    materials: "", dimensions: "", origin: "", location: "",
    model: "", movement_type: "", running_status: "",
    metal_purity: "", stone_type: "", ring_size: "", length: "",
    condition: "very_good", provenance: "",
    description: "", short_description: "", condition_notes: "",
    shipping_notes: "", marks: "", terms_and_conditions: "",
    first_bids_duration_hours: 168,
    prisometer_start_price: "",
    reserve_price: "",
    below_reserve_percent: 10,
    prisometer_duration_hours: 168,
    make_it_mine_enabled: true,
    estimated_low: "", estimated_high: "",
  });

  // Load seller profile and existing item if editing
  useEffect(() => {
    const loadData = async () => {
      const user = await base44.auth.me();
      const [profiles, item] = await Promise.all([
        base44.entities.SellerProfile.filter({ user_email: user.email }),
        editId ? base44.entities.Item.get(editId) : Promise.resolve(null),
      ]);
      setSellerProfile(profiles[0] || null);

      if (editId) {
        if (item) {
          setItemStatus(item.status || "draft");
          setForm({
            images: item.images || [],
            title: item.title || "",
            category: item.category || "",
            subcategory: item.subcategory || "",
            maker: item.maker || "",
            period: item.period || "",
            style: item.style || "",
            technique: item.technique || "",
            keywords: item.keywords || "",
            materials: item.materials || "",
            dimensions: item.dimensions || "",
            origin: item.origin || "",
            location: item.location || profiles[0]?.location || "",
            model: item.model || "",
            movement_type: item.movement_type || "",
            running_status: item.running_status || "",
            metal_purity: item.metal_purity || "",
            stone_type: item.stone_type || "",
            ring_size: item.ring_size || "",
            length: item.length || "",
            condition: item.condition || "very_good",
            provenance: item.provenance || "",
            description: item.description || "",
            short_description: item.short_description || "",
            condition_notes: item.condition_notes || "",
            shipping_notes: item.shipping_notes || "",
            marks: item.marks || "",
            terms_and_conditions: item.terms_and_conditions || "",
            first_bids_duration_hours: item.first_bids_duration_hours || 168,
            prisometer_start_price: item.prisometer_start_price || "",
            reserve_price: item.reserve_price || "",
            below_reserve_percent: item.below_reserve_percent || 10,
            prisometer_duration_hours: item.prisometer_duration_hours || 168,
            make_it_mine_enabled: item.make_it_mine_active !== false,
            estimated_low: item.estimated_low || "",
            estimated_high: item.estimated_high || "",
          });
        }
      } else {
        // Pre-fill location from seller profile for new items
        setForm(f => ({ ...f, location: profiles[0]?.location || "" }));
      }
      setLoading(false);
    };
    loadData();
  }, [editId]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const floorPrice = form.reserve_price && form.below_reserve_percent
    ? (form.reserve_price * (1 - form.below_reserve_percent / 100)).toFixed(0)
    : null;

  const handleImageUpload = async (files) => {
    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, images: [...f.images, file_url] }));
    }
  };

  const removeImage = (idx) =>
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const buildPayload = (extraFields = {}) => ({
    title: form.title || "Untitled Draft",
    category: form.category || "other",
    images: form.images,
    description: form.description,
    condition: form.condition,
    provenance: form.provenance,
    subcategory: form.subcategory || undefined,
    maker: form.maker || undefined,
    style: form.style || undefined,
    technique: form.technique || undefined,
    keywords: form.keywords || undefined,
    model: form.model || undefined,
    movement_type: form.movement_type || undefined,
    running_status: form.running_status || undefined,
    metal_purity: form.metal_purity || undefined,
    stone_type: form.stone_type || undefined,
    ring_size: form.ring_size || undefined,
    length: form.length || undefined,
    materials: form.materials,
    dimensions: form.dimensions,
    period: form.period,
    origin: form.origin,
    location: form.location,
    marks: form.marks || undefined,
    condition_notes: form.condition_notes,
    shipping_notes: form.shipping_notes,
    terms_and_conditions: form.terms_and_conditions || undefined,
    prisometer_start_price: +form.prisometer_start_price || 0,
    reserve_price: +form.reserve_price || 0,
    below_reserve_percent: form.below_reserve_percent,
    prisometer_duration_hours: form.prisometer_duration_hours,
    first_bids_duration_hours: form.first_bids_duration_hours,
    make_it_mine_active: true,
    estimated_low: +form.estimated_low || undefined,
    estimated_high: +form.estimated_high || undefined,
    ...extraFields,
  });

  const notifyWatchers = async (changeDescription) => {
    // Find all watchers for this item and notify them via message
    const watchers = await base44.entities.WatchlistItem.filter({ item_id: editId });
    if (watchers.length === 0) return;
    const currentUser = await base44.auth.me();
    await Promise.all(watchers.map(w =>
      base44.integrations.Core.SendEmail({
        to: w.user_email,
        subject: `Listing Updated: ${form.title}`,
        body: `A listing you're watching has been updated.\n\nItem: ${form.title}\nChange: ${changeDescription}\n\nView the listing to see the latest details.`,
      })
    ));
  };

  const saveDraft = async () => {
    setSaving(true);
    if (isEditMode) {
      if (isLive) {
        // Only allow saving description/condition/photos/notes
        const restrictedPayload = {
          images: form.images,
          description: form.description,
          short_description: form.short_description,
          condition: form.condition,
          condition_notes: form.condition_notes,
          shipping_notes: form.shipping_notes,
        };
        await base44.entities.Item.update(editId, restrictedPayload);
        await notifyWatchers("Description, condition, or photos were updated by the seller.");
      } else {
        await base44.entities.Item.update(editId, buildPayload());
      }
    } else {
      const user = await base44.auth.me();
      await base44.entities.Item.create(buildPayload({ seller_email: user.email, seller_name: user.full_name, status: "draft" }));
    }
    setSaving(false);
    navigate("/seller");
  };

  const relistNow = async () => {
    setSaving(true);
    const now = new Date();
    const firstBidsEnd = new Date(now.getTime() + form.first_bids_duration_hours * 3600000);
    await base44.entities.Item.update(editId, buildPayload({
      status: "first_bids",
      first_bids_start: now.toISOString(),
      first_bids_end: firstBidsEnd.toISOString(),
      highest_bid: 0,
      bid_count: 0,
      sold_price: null,
      sold_to_email: null,
      sold_via: null,
      make_it_mine_active: false,
      make_it_mine_expires: null,
      prisometer_activated_at: null,
      current_price: +form.prisometer_start_price || 0,
    }));
    setSaving(false);
    navigate("/seller");
  };

  const cancelSale = async () => {
    setSaving(true);
    await base44.entities.Item.update(editId, { status: "unsold" });
    await notifyWatchers("This listing has been cancelled by the seller.");
    setSaving(false);
    navigate("/seller");
  };

  const publishNow = async () => {
    setSaving(true);
    const now = new Date();
    const firstBidsEnd = new Date(now.getTime() + form.first_bids_duration_hours * 3600000);
    const liveFields = {
      first_bids_start: now.toISOString(),
      first_bids_end: firstBidsEnd.toISOString(),
      status: "first_bids",
      highest_bid: 0,
      bid_count: 0,
    };
    if (isEditMode) {
      await base44.entities.Item.update(editId, buildPayload(liveFields));
    } else {
      const user = await base44.auth.me();
      await base44.entities.Item.create(buildPayload({ seller_email: user.email, seller_name: user.full_name, ...liveFields }));
    }
    setSaving(false);
    navigate("/seller");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur px-6 py-3 flex items-center gap-4">
        <button onClick={() => navigate("/seller")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="font-serif text-sm font-semibold flex items-center gap-2">
            {isEditMode ? (isLive ? "Edit Live Listing" : "Edit Listing") : "Listing Studio"}
            {isLive && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Limited Editing</span>}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {form.title || "Untitled listing"} · Step {step} of {STEPS.length}
          </p>
        </div>
        {isLive && isEditMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCancelConfirm(true)}
            className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <XCircle className="w-3.5 h-3.5" /> Cancel Sale
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={saveDraft} disabled={saving} className="gap-1.5 text-xs">
          <Save className="w-3.5 h-3.5" /> {isEditMode ? "Save Changes" : "Save Draft"}
        </Button>
      </header>

      {/* Cancel Sale Confirmation */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCancelConfirm(false)}>
          <div className="bg-card rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Cancel this listing?</h3>
                <p className="text-xs text-muted-foreground mt-1">This will end the sale immediately. All watchers and bidders will be notified. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="destructive" size="sm" className="flex-1" onClick={cancelSale} disabled={saving}>
                {saving ? "Cancelling…" : "Yes, Cancel Sale"}
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setCancelConfirm(false)}>Keep Listing</Button>
            </div>
          </div>
        </div>
      )}

      {/* Unsold relist banner */}
      {isUnsold && isEditMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span><strong>Unsold item:</strong> Update any details, pricing or photos below, then relist when ready.</span>
        </div>
      )}

      {/* Live edit restriction banner */}
      {isLive && isEditMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-800">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span><strong>Limited editing:</strong> Pricing and duration cannot be changed once a listing is live. You may update photos, description, and condition only.</span>
        </div>
      )}

      {/* Progress */}
      <div className="h-0.5 bg-secondary">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Step tabs */}
      <div className="flex items-center gap-1 px-6 py-4 border-b border-border overflow-x-auto">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          const locked = isLive && !liveAllowedSteps.includes(s.id);
          return (
            <button key={s.id}
              onClick={() => !locked && setStep(s.id)}
              disabled={locked}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                active && "bg-primary text-primary-foreground",
                done && !locked && "bg-secondary text-foreground",
                locked && "opacity-40 cursor-not-allowed",
                !active && !done && !locked && "text-muted-foreground hover:bg-secondary/60"
              )}>
              {locked ? <Lock className="w-3.5 h-3.5" /> : done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">

          {/* STEP 1: MEDIA */}
          {step === 1 && (
            <StepShell title="Photography" subtitle="Great photographs are the foundation of every successful listing. Upload your best images first.">
              <DropZone onFiles={handleImageUpload} />
              {form.images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">{form.images.length} image{form.images.length !== 1 ? "s" : ""} uploaded</p>
                    <p className="text-xs text-muted-foreground">Drag to reorder · First image is cover</p>
                  </div>
                  <DragDropContext onDragEnd={({ source, destination }) => {
                    if (!destination || source.index === destination.index) return;
                    const imgs = [...form.images];
                    const [moved] = imgs.splice(source.index, 1);
                    imgs.splice(destination.index, 0, moved);
                    set("images", imgs);
                  }}>
                    <Droppable droppableId="images" direction="horizontal">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="grid grid-cols-3 sm:grid-cols-4 gap-3"
                        >
                          {form.images.map((url, i) => (
                            <Draggable key={url + i} draggableId={`img-${i}`} index={i}>
                              {(drag, snapshot) => (
                                <div
                                  ref={drag.innerRef}
                                  {...drag.draggableProps}
                                  className={cn(
                                    "relative rounded-xl overflow-hidden border-2 aspect-square group",
                                    i === 0 ? "border-primary" : "border-border",
                                    snapshot.isDragging && "shadow-xl scale-105 z-10"
                                  )}
                                >
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                  {/* Drag handle */}
                                  <div {...drag.dragHandleProps}
                                    className="absolute top-1.5 left-1.5 bg-black/50 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-3 h-3" />
                                  </div>
                                  {i === 0 && (
                                    <div className="absolute bottom-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                                      Cover
                                    </div>
                                  )}
                                  <button onClick={() => removeImage(i)}
                                    className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}
              <Tip>Tip: Upload 6–12 high-resolution images including all angles, maker's marks, and condition details. Natural light photography performs best.</Tip>
            </StepShell>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <StepShell title="Item Details" subtitle={isLive ? "This listing is live. Details cannot be edited." : "Accurate details help buyers discover and trust your listing."}>
              {isLive && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-2 text-xs text-amber-800">
                  <Lock className="w-4 h-4 shrink-0" />
                  Item details are locked once a listing goes live to ensure buyer trust.
                </div>
              )}
              <div className="space-y-4">
                <Field label="Title" required>
                  <Input placeholder="e.g. Fernand Léger — Composition with Figures, 1928" value={form.title} onChange={e => set("title", e.target.value)} disabled={isLive} />
                </Field>

                {/* Category selector */}
                <Field label="Category" required>
                  <select value={form.category} onChange={e => { set("category", e.target.value); set("subcategory", ""); set("style", ""); }}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                    <option value="">Select category…</option>
                    {MAIN_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>

                {/* Conditional category-specific fields */}
                {form.category && <CategoryFields form={form} set={set} />}

                {/* Always-present fields */}
                <Field label="Dimensions">
                  <Input placeholder="e.g. 60 × 80 cm, H 12 in." value={form.dimensions} onChange={e => set("dimensions", e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Condition">
                    <select value={form.condition} onChange={e => set("condition", e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                      {CONDITIONS.map(c => <option key={c} value={c}>{c.replace(/_/g," ")}</option>)}
                    </select>
                  </Field>
                  <Field label="Location">
                    <Input placeholder="e.g. Kingston NY 12401" value={form.location} onChange={e => set("location", e.target.value)} />
                  </Field>
                </div>
                <Field label="Provenance Summary">
                  <Input placeholder="e.g. Private collection, Paris; acquired 1974" value={form.provenance} onChange={e => set("provenance", e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Estimate Low (optional)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" className="pl-6" value={form.estimated_low} onChange={e => set("estimated_low", e.target.value)} />
                    </div>
                  </Field>
                  <Field label="Estimate High (optional)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" className="pl-6" value={form.estimated_high} onChange={e => set("estimated_high", e.target.value)} />
                    </div>
                  </Field>
                </div>
              </div>
            </StepShell>
          )}

          {/* STEP 3: DESCRIPTION */}
          {step === 3 && (
            <StepShell title="Description" subtitle="Write a compelling editorial description. Good writing adds significant value.">
              <div className="space-y-4">
                <Field label="Short Summary" hint="Appears in search results and listing cards">
                  <Textarea placeholder="A concise one or two sentence description for listings and previews…" value={form.short_description} onChange={e => set("short_description", e.target.value)} className="h-20" />
                </Field>
                <Field label="Full Description">
                  <Textarea placeholder="Describe the work in detail — style, context, significance, visual qualities, notable characteristics…" value={form.description} onChange={e => set("description", e.target.value)} className="h-40" />
                </Field>
                <Field label="Condition Notes">
                  <Textarea placeholder="Describe any wear, restoration, or damage in detail. Honesty builds trust." value={form.condition_notes} onChange={e => set("condition_notes", e.target.value)} className="h-20" />
                </Field>
                <Field label="Marks / Signatures / Labels">
                  <Input placeholder="e.g. Signed lower right in pencil; gallery label verso" value={form.marks} onChange={e => set("marks", e.target.value)} />
                </Field>
                <Field label="Extended Provenance">
                  <Textarea placeholder="Full provenance history, exhibition history, literature references…" value={form.provenance} onChange={e => set("provenance", e.target.value)} className="h-24" />
                </Field>
                <Field label="Shipping Notes">
                   <Textarea placeholder="Describe packaging, fragility, or special shipping requirements…" value={form.shipping_notes} onChange={e => set("shipping_notes", e.target.value)} className="h-20" />
                 </Field>
                 <Field label="Auction Terms & Conditions (optional)">
                   <Textarea placeholder="e.g. Payment due within 7 days. All sales are final. Ships within 5 business days of cleared payment." value={form.terms_and_conditions} onChange={e => set("terms_and_conditions", e.target.value)} className="h-20" />
                   <p className="text-xs text-muted-foreground mt-1">These will be shown to buyers and they must agree before placing bids.</p>
                 </Field>
                </div>
                </StepShell>
                )}

          {/* STEP 4: SALES SETUP */}
          {step === 4 && (
            <StepShell title="Sales Setup" subtitle={isLive ? "Pricing and duration cannot be changed while a listing is live." : "Configure how your item sells through the PRI$OMETER™ engine."}>
              {isLive && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-4 flex items-start gap-3 text-sm text-amber-800">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Sales setup is locked while this listing is active. Pricing and duration protect buyers and bidders who are already engaged.</p>
                </div>
              )}
              <div className={cn("space-y-6", isLive && "pointer-events-none opacity-50")}>

                {/* How it works callout */}
                <div className="rounded-xl bg-primary/5 border border-primary/20 px-5 py-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">How it works</p>
                  <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">① 1stBid$™</p>
                      <p>Preview period where buyers place advance bids before the live phase begins.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">② PRI$OMETER™</p>
                      <p>Price descends live from start to floor. First buyer to claim it — wins it.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">③ Make It Mine™</p>
                      <p>Any buyer can pause the PRI$OMETER instantly and lock in the live price.</p>
                    </div>
                  </div>
                </div>

                {/* 1stBid$ Duration */}
                <Field label="1stBid$™ Preview Duration">
                  <div className="flex gap-2 flex-wrap">
                    {[168, 504, 720].map(h => (
                      <button key={h} onClick={() => set("first_bids_duration_hours", h)}
                        className={cn("px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                          form.first_bids_duration_hours === h ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-foreground/30"
                        )}>
                        {h/24}d
                      </button>
                    ))}
                  </div>
                </Field>

                {/* PRI$OMETER Duration */}
                <Field label="PRI$OMETER™ Live Duration">
                  <div className="flex gap-2 flex-wrap">
                    {[168, 336, 504].map(h => (
                      <button key={h} onClick={() => set("prisometer_duration_hours", h)}
                        className={cn("px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                          form.prisometer_duration_hours === h ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-foreground/30"
                        )}>
                        {h/24}d
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Visible Start Price" required>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" className="pl-6" placeholder="e.g. 12,000" value={form.prisometer_start_price} onChange={e => set("prisometer_start_price", e.target.value)} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">This price is shown publicly to buyers.</p>
                  </Field>
                  <Field label="Hidden Reserve Price" required>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" className="pl-6" placeholder="e.g. 8,000" value={form.reserve_price} onChange={e => set("reserve_price", e.target.value)} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">Never shown to buyers. Determines auto-sale vs. review.</p>
                  </Field>
                </div>

                {/* Below reserve buffer */}
                <Field label="Below-Reserve Drop Allowance" hint="how far below reserve the price may descend">
                  <div className="flex gap-2">
                    {[10, 15, 20].map(pct => (
                      <button key={pct} onClick={() => set("below_reserve_percent", pct)}
                        className={cn("px-4 py-2 rounded-lg border text-sm font-medium transition-all flex-1",
                          form.below_reserve_percent === pct ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-foreground/30"
                        )}>
                        {pct}%
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Make It Mine */}
                <div className="flex items-center justify-between rounded-xl border border-border px-5 py-4 bg-primary/5">
                  <div>
                    <p className="text-sm font-medium">Make It Mine™</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Always enabled — buyers can instantly pause and purchase at the live price.</p>
                  </div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Always On</span>
                </div>

                {/* Live Simulation */}
                {form.prisometer_start_price && form.reserve_price && (
                  <div className="rounded-xl border border-border bg-secondary/30 px-5 py-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Listing Preview</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div><p className="text-muted-foreground mb-0.5">Preview Period</p><p className="font-medium">{form.first_bids_duration_hours}h</p></div>
                      <div><p className="text-muted-foreground mb-0.5">Start Price</p><p className="font-medium">${Number(form.prisometer_start_price).toLocaleString()}</p></div>
                      <div><p className="text-muted-foreground mb-0.5">Reserve (hidden)</p><p className="font-medium text-muted-foreground italic">Hidden</p></div>
                      <div><p className="text-muted-foreground mb-0.5">Price Floor</p><p className="font-medium">{floorPrice ? `$${Number(floorPrice).toLocaleString()}` : "—"}</p></div>
                    </div>
                    <div className="border-t border-border pt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                        <p className="font-medium text-green-800">Above Reserve → Auto Sale</p>
                        <p className="text-green-600 mt-0.5">Sells automatically and immediately.</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                        <p className="font-medium text-amber-800">Below Reserve → Seller Review</p>
                        <p className="text-amber-600 mt-0.5">You decide whether to accept.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </StepShell>
          )}

          {/* STEP 5: REVIEW & PUBLISH */}
          {step === 5 && (
            <StepShell title="Review & Publish" subtitle="Almost there. Review your listing before it goes live.">
              <div className="space-y-4">

                {/* Preview card */}
                <div className="rounded-2xl border border-border overflow-hidden bg-card">
                  {form.images[0] && (
                    <img src={form.images[0]} alt="" className="w-full h-52 object-cover" />
                  )}
                  <div className="p-5 space-y-1">
                    <p className="font-serif text-xl font-semibold">{form.title || "Untitled Listing"}</p>
                    <p className="text-sm text-muted-foreground capitalize">{form.category?.replace(/_/g," ")} {form.period ? `· ${form.period}` : ""}</p>
                    {form.short_description && <p className="text-sm text-muted-foreground leading-relaxed pt-1">{form.short_description}</p>}
                  </div>
                </div>

                {/* Summary grid */}
                <div className="rounded-xl border border-border bg-card divide-y divide-border text-sm">
                  {[
                    ["Condition", form.condition?.replace(/_/g," ")],
                    ["Materials", form.materials],
                    ["Dimensions", form.dimensions],
                    ["Provenance", form.provenance],
                    ["Preview Duration", form.first_bids_duration_hours ? `${form.first_bids_duration_hours} hours` : "—"],
                    ["Start Price", form.prisometer_start_price ? `$${Number(form.prisometer_start_price).toLocaleString()}` : "—"],
                    ["Reserve", "Hidden from buyers"],
                    ["Price Floor", floorPrice ? `$${Number(floorPrice).toLocaleString()} (${form.below_reserve_percent}% below reserve)` : "—"],
                    ["PRI$OMETER Duration", form.prisometer_duration_hours ? `${form.prisometer_duration_hours} hours` : "—"],
                    ["Make It Mine™", "Always Enabled"],
                  ].filter(([,v]) => v).map(([k,v]) => (
                    <div key={k} className="flex justify-between px-5 py-3">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium capitalize max-w-xs text-right">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Images count */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{form.images.length} photo{form.images.length !== 1 ? "s" : ""} uploaded</span>
                </div>

                {/* Publish actions */}
                {isLive ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button onClick={saveDraft} disabled={saving} className="gap-2 h-12 bg-primary">
                      <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCancelConfirm(true)}
                      className="gap-2 h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Sale
                    </Button>
                  </div>
                ) : isUnsold ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button variant="outline" onClick={saveDraft} disabled={saving} className="gap-2 h-12">
                      <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
                    </Button>
                    <Button onClick={relistNow} disabled={saving || !form.title || !form.prisometer_start_price} className="gap-2 h-12 bg-primary">
                      <Rocket className="w-4 h-4" /> {saving ? "Relisting…" : "Relist Now"}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <Button variant="outline" onClick={saveDraft} disabled={saving} className="gap-2 h-12">
                      <Save className="w-4 h-4" /> Save Draft
                    </Button>
                    <Button variant="outline" disabled className="gap-2 h-12 opacity-60">
                      <Calendar className="w-4 h-4" /> Schedule
                    </Button>
                    <Button onClick={publishNow} disabled={saving || !form.title || !form.prisometer_start_price} className="gap-2 h-12 bg-primary">
                      <Rocket className="w-4 h-4" /> {saving ? "Publishing…" : "Publish Now"}
                    </Button>
                  </div>
                )}
              </div>
            </StepShell>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1
              ? <Button variant="outline" onClick={() => {
                  if (isLive) {
                    const prev = liveAllowedSteps.filter(s => s < step);
                    if (prev.length > 0) setStep(prev[prev.length - 1]);
                  } else {
                    setStep(s => s - 1);
                  }
                }} className="gap-2"><ChevronLeft className="w-4 h-4" /> Back</Button>
              : <Button variant="outline" onClick={() => navigate("/seller")} className="gap-2"><ChevronLeft className="w-4 h-4" /> Dashboard</Button>
            }
            {step < 5 && (
              <Button onClick={() => {
                if (isLive) {
                  const next = liveAllowedSteps.filter(s => s > step);
                  if (next.length > 0) setStep(next[0]);
                } else {
                  setStep(s => s + 1);
                }
              }} className="gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepShell({ title, subtitle, children }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1">
        {label} {required && <span className="text-destructive">*</span>}
        {hint && <span className="text-xs text-muted-foreground font-normal ml-1">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Tip({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-secondary/50 border border-border px-4 py-3">
      <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function DropZone({ onFiles }) {
  const [dragging, setDragging] = useState(false);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    onFiles(e.dataTransfer.files);
  }, [onFiles]);

  return (
    <label
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all py-14 px-6 text-center",
        dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-secondary/20"
      )}>
      <Upload className="w-8 h-8 text-muted-foreground mb-3" />
      <p className="font-medium text-sm">Drop photos here or click to browse</p>
      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WEBP · Up to 20MB per image · Multiple files accepted</p>
      <input type="file" accept="image/*" multiple className="sr-only" onChange={e => onFiles(e.target.files)} />
    </label>
  );
}