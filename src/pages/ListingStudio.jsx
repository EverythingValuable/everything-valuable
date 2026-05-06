import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, Upload, X, GripVertical, Lock, AlertTriangle,
  XCircle, Save, Rocket, Calendar, Info, Download
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CategoryFields from "../components/listing/CategoryFields";
import CustomFieldsEditor from "../components/listing/CustomFieldsEditor";
import { MAIN_CATEGORIES } from "@/lib/categoryConfig";

const LIVE_STATUSES = ["first_bids", "prisometer", "pending_review"];
const UNSOLD_STATUS = "unsold";
const CONDITIONS = ["excellent", "very_good", "good", "fair", "as_is"];

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, children, locked }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 space-y-4", locked && "opacity-60 pointer-events-none")}>
      <h3 className="font-serif text-base font-semibold text-foreground flex items-center gap-2">
        {locked && <Lock className="w-3.5 h-3.5 text-amber-600" />}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
        {label}{required && <span className="text-destructive">*</span>}
        {hint && <span className="font-normal normal-case tracking-normal ml-1">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function PriceInput({ value, onChange, placeholder, disabled }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
      <Input type="number" className="pl-6" placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} />
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
        "flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all py-8 px-6 text-center",
        dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-secondary/20"
      )}>
      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
      <p className="font-medium text-sm">Drop photos here or click to browse</p>
      <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG, WEBP · Multiple files accepted</p>
      <input type="file" accept="image/*" multiple className="sr-only" onChange={e => onFiles(e.target.files)} />
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ListingStudio() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");
  const isEditMode = !!editId;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [itemStatus, setItemStatus] = useState("draft");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const isLive = LIVE_STATUSES.includes(itemStatus);
  const isUnsold = itemStatus === UNSOLD_STATUS;

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
    estimated_low: "", estimated_high: "",
    internal_notes: "",
    custom_fields: [],
    inventory_number: "",
    ownership_type: "owned",
    consignor_name: "", consignor_email: "", consignor_phone: "",
    consignor_address: "", consignor_commission_percent: "",
    consignor_notes: "",
    customer_location: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Load data
  useEffect(() => {
    const loadData = async () => {
      const user = await base44.auth.me();
      const [profiles, item] = await Promise.all([
        base44.entities.SellerProfile.filter({ user_email: user.email }),
        editId ? base44.entities.Item.get(editId) : Promise.resolve(null),
      ]);
      const profile = profiles[0] || null;
      setSellerProfile(profile);
      if (item) {
        setItemStatus(item.status || "draft");
        // Parse custom_fields from internal_notes if stored there as JSON
        // Seed values from stored data; labels/types come from profile template
        const template = profile?.listing_custom_fields_template || [];
        let storedValues = {};
        try {
          const parsed = JSON.parse(item.internal_notes || "{}");
          (parsed.custom_fields || []).forEach(f => { storedValues[f.label] = f.value; });
        } catch {}
        const customFields = template.map(f => ({ ...f, value: storedValues[f.label] ?? "" }));
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
          estimated_low: item.estimated_low || "",
          estimated_high: item.estimated_high || "",
          internal_notes: item.internal_notes || "",
          custom_fields: customFields,
          inventory_number: item.inventory_number || "",
          ownership_type: item.ownership_type || "owned",
          consignor_name: item.consignor_name || "",
          consignor_email: item.consignor_email || "",
          consignor_phone: item.consignor_phone || "",
          consignor_address: item.consignor_address || "",
          consignor_commission_percent: item.consignor_commission_percent || "",
          consignor_notes: item.consignor_notes || "",
          customer_location: item.customer_location || "",
        });
      } else {
        // New listing — seed custom fields from profile template (empty values)
        const template = profile?.listing_custom_fields_template || [];
        const seededFields = template.map(f => ({ ...f, value: "" }));
        setForm(f => ({ ...f, location: profile?.location || "", custom_fields: seededFields }));
      }
      setLoading(false);
    };
    loadData();
  }, [editId]);

  const handleImageUpload = async (files) => {
    setUploadingImages(true);
    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, images: [...f.images, file_url] }));
    }
    setUploadingImages(false);
  };

  const removeImage = (idx) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const buildPayload = (extraFields = {}) => ({
    title: form.title || "Untitled Draft",
    category: form.category || "other",
    images: form.images,
    description: form.description,
    short_description: form.short_description,
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
    customer_location: form.customer_location || undefined,
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
    // Store custom fields as JSON in internal_notes
    internal_notes: JSON.stringify({ custom_fields: form.custom_fields }),
    inventory_number: form.inventory_number || undefined,
    ownership_type: form.ownership_type,
    consignor_name: form.ownership_type === "consignment" ? form.consignor_name : undefined,
    consignor_email: form.ownership_type === "consignment" ? form.consignor_email : undefined,
    consignor_phone: form.ownership_type === "consignment" ? form.consignor_phone : undefined,
    consignor_address: form.ownership_type === "consignment" ? form.consignor_address : undefined,
    consignor_commission_percent: form.ownership_type === "consignment" ? (+form.consignor_commission_percent || undefined) : undefined,
    consignor_notes: form.ownership_type === "consignment" ? form.consignor_notes : undefined,
    ...extraFields,
  });

  const notifyWatchers = async (changeDescription) => {
    const watchers = await base44.entities.WatchlistItem.filter({ item_id: editId });
    if (watchers.length === 0) return;
    await Promise.all(watchers.map(w =>
      base44.integrations.Core.SendEmail({
        to: w.user_email,
        subject: `Listing Updated: ${form.title}`,
        body: `A listing you're watching has been updated.\n\nItem: ${form.title}\nChange: ${changeDescription}`,
      })
    ));
  };

  const saveDraft = async () => {
    setSaving(true);
    if (isEditMode) {
      if (isLive) {
        const restrictedPayload = {
          images: form.images,
          category: form.category,
          subcategory: form.subcategory || undefined,
          style: form.style || undefined,
          maker: form.maker || undefined,
          period: form.period || undefined,
          technique: form.technique || undefined,
          description: form.description,
          short_description: form.short_description,
          condition: form.condition,
          condition_notes: form.condition_notes,
          shipping_notes: form.shipping_notes,
          internal_notes: JSON.stringify({ custom_fields: form.custom_fields }),
          inventory_number: form.inventory_number || undefined,
          location: form.location || undefined,
          customer_location: form.customer_location || undefined,
        };
        await base44.entities.Item.update(editId, restrictedPayload);
        await notifyWatchers("Category, description, photos, or condition was updated.");
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
      highest_bid: 0, bid_count: 0,
      sold_price: null, sold_to_email: null, sold_via: null,
      make_it_mine_active: false, make_it_mine_expires: null,
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
    const liveFields = { first_bids_start: now.toISOString(), first_bids_end: firstBidsEnd.toISOString(), status: "first_bids", highest_bid: 0, bid_count: 0 };
    if (isEditMode) {
      await base44.entities.Item.update(editId, buildPayload(liveFields));
    } else {
      const user = await base44.auth.me();
      await base44.entities.Item.create(buildPayload({ seller_email: user.email, seller_name: user.full_name, ...liveFields }));
    }
    setSaving(false);
    navigate("/seller");
  };

  // Save the field structure (label + type, no values) back to seller profile as template
  const saveFieldTemplate = async (fields) => {
    if (!sellerProfile?.id) return;
    const template = fields.map(({ label, type }) => ({ label, type }));
    await base44.entities.SellerProfile.update(sellerProfile.id, { listing_custom_fields_template: template });
    setSellerProfile(p => ({ ...p, listing_custom_fields_template: template }));
  };

  const handleCustomFieldsChange = (fields) => {
    set("custom_fields", fields);
    saveFieldTemplate(fields);
  };

  const exportCSV = () => {
    const coreFields = [
      ["Title", form.title],
      ["Category", form.category],
      ["Maker", form.maker],
      ["Period", form.period],
      ["Dimensions", form.dimensions],
      ["Condition", form.condition],
      ["Location", form.location],
      ["Estimate Low", form.estimated_low],
      ["Estimate High", form.estimated_high],
      ["Start Price", form.prisometer_start_price],
      ["Reserve Price", form.reserve_price],
      ["1stBid Duration (hrs)", form.first_bids_duration_hours],
      ["PRI$OMETER Duration (hrs)", form.prisometer_duration_hours],
    ];
    const customRows = form.custom_fields.map(f => [f.label, f.value]);
    const allRows = [...coreFields, ...customRows];
    const csv = allRows.map(([k, v]) => `"${k}","${String(v ?? "").replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title || "listing"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const floorPrice = form.reserve_price && form.below_reserve_percent
    ? (form.reserve_price * (1 - form.below_reserve_percent / 100)).toFixed(0)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(40,20%,97%)]">

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur px-4 md:px-8 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/seller")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-sm font-semibold truncate">
            {isEditMode ? (isLive ? "Edit Live Listing" : "Edit Listing") : "New Listing"}
            {isLive && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Limited Editing</span>}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">{form.title || "Untitled listing"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 text-xs hidden sm:flex">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
        {isLive && isEditMode && (
          <Button variant="outline" size="sm" onClick={() => setCancelConfirm(true)} className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
            <XCircle className="w-3.5 h-3.5" /> Cancel Sale
          </Button>
        )}
        <Button size="sm" onClick={saveDraft} disabled={saving} className="gap-1.5 text-xs">
          <Save className="w-3.5 h-3.5" /> {isEditMode ? "Save" : "Save Draft"}
        </Button>
      </header>

      {/* Banners */}
      {isLive && isEditMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-800">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span><strong>Limited editing:</strong> Pricing and duration cannot be changed while a listing is live.</span>
        </div>
      )}
      {isUnsold && isEditMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span><strong>Unsold item:</strong> Update details or pricing below, then relist when ready.</span>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCancelConfirm(false)}>
          <div className="bg-card rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Cancel this listing?</h3>
                <p className="text-xs text-muted-foreground mt-1">This will end the sale immediately. All watchers and bidders will be notified.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="destructive" size="sm" className="flex-1" onClick={cancelSale} disabled={saving}>{saving ? "Cancelling…" : "Yes, Cancel Sale"}</Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setCancelConfirm(false)}>Keep Listing</Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN — Photos + Details + Description */}
        <div className="lg:col-span-2 space-y-6">

          {/* PHOTOS */}
          <Section title="Photos">
            <DropZone onFiles={handleImageUpload} />
            {uploadingImages && <p className="text-xs text-muted-foreground animate-pulse">Uploading…</p>}
            {form.images.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Drag to reorder · First image is cover</p>
                <DragDropContext onDragEnd={({ source, destination }) => {
                  if (!destination || source.index === destination.index) return;
                  const imgs = [...form.images];
                  const [moved] = imgs.splice(source.index, 1);
                  imgs.splice(destination.index, 0, moved);
                  set("images", imgs);
                }}>
                  <Droppable droppableId="images" direction="horizontal">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {form.images.map((url, i) => (
                          <Draggable key={url + i} draggableId={`img-${i}`} index={i}>
                            {(drag, snapshot) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                className={cn("relative rounded-lg overflow-hidden border-2 aspect-square group", i === 0 ? "border-primary" : "border-border", snapshot.isDragging && "shadow-xl scale-105 z-10")}
                              >
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <div {...drag.dragHandleProps} className="absolute top-1 left-1 bg-black/50 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                                  <GripVertical className="w-2.5 h-2.5" />
                                </div>
                                {i === 0 && <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[9px] px-1 py-0.5 rounded font-medium">Cover</div>}
                                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-2.5 h-2.5" />
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
          </Section>

          {/* INVENTORY # + LOCATION — always visible at top */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-serif text-base font-semibold text-foreground">Inventory & Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Inventory Number" hint="internal reference only">
                <Input placeholder="e.g. EV-2024-001" value={form.inventory_number} onChange={e => set("inventory_number", e.target.value)} />
              </Field>
              <Field label="Internal Storage Location" hint="not shown to buyers">
                <Input placeholder="e.g. Warehouse B, Shelf 3" value={form.location} onChange={e => set("location", e.target.value)} />
              </Field>
              <Field label="Item Location" hint="shown to buyers">
                <Input placeholder="e.g. New York, NY" value={form.customer_location} onChange={e => set("customer_location", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* ITEM DETAILS */}
          <Section title="Item Details" locked={isLive}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Title" required>
                  <Input placeholder="e.g. Fernand Léger — Composition with Figures, 1928" value={form.title} onChange={e => set("title", e.target.value)} />
                </Field>
              </div>
              <Field label="Category" required>
                <select value={form.category} onChange={e => { set("category", e.target.value); set("subcategory", ""); set("style", ""); }}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Select category…</option>
                  {MAIN_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Condition">
                <select value={form.condition} onChange={e => set("condition", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
              </Field>
            </div>

            {form.category && <CategoryFields form={form} set={set} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Dimensions">
                <Input placeholder="e.g. 60 × 80 cm, H 12 in." value={form.dimensions} onChange={e => set("dimensions", e.target.value)} />
              </Field>
              <Field label="Materials">
                <Input placeholder="e.g. Oil on canvas, Bronze" value={form.materials} onChange={e => set("materials", e.target.value)} />
              </Field>
              <Field label="Origin">
                <Input placeholder="e.g. France" value={form.origin} onChange={e => set("origin", e.target.value)} />
              </Field>
              <Field label="Marks / Signatures">
                <Input placeholder="e.g. Signed lower right in pencil" value={form.marks} onChange={e => set("marks", e.target.value)} />
              </Field>
              <Field label="Provenance">
                <Input placeholder="e.g. Private collection, Paris; acquired 1974" value={form.provenance} onChange={e => set("provenance", e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* DESCRIPTION */}
          <Section title="Description">
            <Field label="Short Summary" hint="shown in search results">
              <Textarea placeholder="A concise one or two sentence description…" value={form.short_description} onChange={e => set("short_description", e.target.value)} className="h-16" />
            </Field>
            <Field label="Full Description">
              <Textarea placeholder="Describe the work in detail — style, context, significance, visual qualities…" value={form.description} onChange={e => set("description", e.target.value)} className="h-32" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Condition Notes">
                <Textarea placeholder="Wear, restoration, or damage details…" value={form.condition_notes} onChange={e => set("condition_notes", e.target.value)} className="h-20" />
              </Field>
              <Field label="Shipping Notes">
                <Textarea placeholder="Packaging, fragility, shipping requirements…" value={form.shipping_notes} onChange={e => set("shipping_notes", e.target.value)} className="h-20" />
              </Field>
            </div>
            <Field label="Auction Terms & Conditions" hint="optional">
              <Textarea placeholder="Payment due within 7 days. All sales final…" value={form.terms_and_conditions} onChange={e => set("terms_and_conditions", e.target.value)} className="h-20" />
            </Field>
          </Section>

          {/* INVENTORY & OWNERSHIP */}
          <Section title="Ownership">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
              <Field label="Ownership Type">
                <div className="flex gap-2">
                  {[["owned", "Self-Owned"], ["consignment", "Consignment"]].map(([val, label]) => (
                    <button key={val} onClick={() => set("ownership_type", val)}
                      className={cn("flex-1 py-2 rounded-lg border text-xs font-semibold transition-all",
                        form.ownership_type === val
                          ? val === "consignment" ? "border-violet-400 bg-violet-50 text-violet-700" : "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              </div>
            </div>

            {form.ownership_type === "consignment" && (
              <div className="space-y-4 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Consignor Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Consignor Name" required>
                    <Input placeholder="Full name" value={form.consignor_name} onChange={e => set("consignor_name", e.target.value)} />
                  </Field>
                  <Field label="Consignor Email">
                    <Input type="email" placeholder="email@example.com" value={form.consignor_email} onChange={e => set("consignor_email", e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <Input placeholder="+1 (555) 000-0000" value={form.consignor_phone} onChange={e => set("consignor_phone", e.target.value)} />
                  </Field>
                  <Field label="Commission %" hint="seller keeps">
                    <div className="relative">
                      <Input type="number" placeholder="e.g. 30" value={form.consignor_commission_percent} onChange={e => set("consignor_commission_percent", e.target.value)} className="pr-7" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    </div>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Consignor Address">
                      <Input placeholder="Street, City, State, ZIP" value={form.consignor_address} onChange={e => set("consignor_address", e.target.value)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Consignment Notes" hint="agreement terms, special instructions">
                      <Textarea placeholder="Payment terms, pickup/drop-off, special conditions…" value={form.consignor_notes} onChange={e => set("consignor_notes", e.target.value)} className="h-20" />
                    </Field>
                  </div>
                </div>
                {form.consignor_commission_percent && form.prisometer_start_price && (
                  <div className="bg-violet-50 rounded-lg px-3 py-2 text-xs text-violet-700 space-y-0.5">
                    <p className="font-semibold">Estimated consignor payout at start price</p>
                    <p>${(form.prisometer_start_price * (1 - form.consignor_commission_percent / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({100 - +form.consignor_commission_percent}% of ${(+form.prisometer_start_price).toLocaleString()})</p>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* CUSTOM TRACKING FIELDS */}
          <Section title="Custom Tracking Fields">
            <p className="text-xs text-muted-foreground -mt-2">Add your own fields to track internal data (cost, insurance value, etc.). Your field layout is saved to your profile and pre-filled on every new listing.</p>
            <CustomFieldsEditor
              fields={form.custom_fields}
              onChange={handleCustomFieldsChange}
            />
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 text-xs mt-1">
              <Download className="w-3.5 h-3.5" /> Export All Fields as CSV
            </Button>
          </Section>
        </div>

        {/* RIGHT COLUMN — Sales Setup + Publish */}
        <div className="space-y-6">

          {/* ESTIMATES */}
          <Section title="Estimates" locked={isLive}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Est. Low">
                <PriceInput placeholder="0" value={form.estimated_low} onChange={e => set("estimated_low", e.target.value)} />
              </Field>
              <Field label="Est. High">
                <PriceInput placeholder="0" value={form.estimated_high} onChange={e => set("estimated_high", e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* SALES SETUP */}
          <Section title="Sales Setup" locked={isLive}>
            <Field label="Visible Start Price" required>
              <PriceInput placeholder="e.g. 12,000" value={form.prisometer_start_price} onChange={e => set("prisometer_start_price", e.target.value)} />
              <p className="text-[11px] text-muted-foreground mt-1">Shown publicly to buyers.</p>
            </Field>
            <Field label="Hidden Reserve Price" required>
              <PriceInput placeholder="e.g. 8,000" value={form.reserve_price} onChange={e => set("reserve_price", e.target.value)} />
              <p className="text-[11px] text-muted-foreground mt-1">Never shown to buyers.</p>
            </Field>

            <Field label="Below-Reserve Drop Allowance">
              <div className="flex gap-1.5">
                {[10, 15, 20].map(pct => (
                  <button key={pct} onClick={() => set("below_reserve_percent", pct)}
                    className={cn("flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      form.below_reserve_percent === pct ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-foreground/30"
                    )}>
                    {pct}%
                  </button>
                ))}
              </div>
            </Field>

            {floorPrice && (
              <div className="bg-secondary/50 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                Price floor: <span className="font-semibold text-foreground">${Number(floorPrice).toLocaleString()}</span>
              </div>
            )}

            <Field label="1stBid$™ Preview Duration">
              <div className="flex gap-1.5 flex-wrap">
                {[168, 504, 720].map(h => (
                  <button key={h} onClick={() => set("first_bids_duration_hours", h)}
                    className={cn("px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      form.first_bids_duration_hours === h ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-foreground/30"
                    )}>
                    {h / 24}d
                  </button>
                ))}
              </div>
            </Field>

            <Field label="PRI$OMETER™ Live Duration">
              <div className="flex gap-1.5 flex-wrap">
                {[168, 336, 504].map(h => (
                  <button key={h} onClick={() => set("prisometer_duration_hours", h)}
                    className={cn("px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      form.prisometer_duration_hours === h ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-foreground/30"
                    )}>
                    {h / 24}d
                  </button>
                ))}
              </div>
            </Field>

            <div className="bg-primary/5 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
              <span className="font-medium">Make It Mine™</span>
              <span className="text-primary font-semibold uppercase tracking-wide">Always On</span>
            </div>
          </Section>

          {/* PUBLISH ACTIONS */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-serif text-sm font-semibold">Publish</h3>

            {isLive ? (
              <>
                <Button className="w-full gap-2" onClick={saveDraft} disabled={saving}>
                  <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
                </Button>
                <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setCancelConfirm(true)}>
                  <XCircle className="w-4 h-4" /> Cancel Sale
                </Button>
              </>
            ) : isUnsold ? (
              <>
                <Button variant="outline" className="w-full gap-2" onClick={saveDraft} disabled={saving}>
                  <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
                </Button>
                <Button className="w-full gap-2 bg-primary" onClick={relistNow} disabled={saving || !form.title || !form.prisometer_start_price}>
                  <Rocket className="w-4 h-4" /> {saving ? "Relisting…" : "Relist Now"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full gap-2" onClick={saveDraft} disabled={saving}>
                  <Save className="w-4 h-4" /> Save Draft
                </Button>
                <Button variant="outline" disabled className="w-full gap-2 opacity-50">
                  <Calendar className="w-4 h-4" /> Schedule (coming soon)
                </Button>
                <Button className="w-full gap-2 bg-primary" onClick={publishNow} disabled={saving || !form.title || !form.prisometer_start_price}>
                  <Rocket className="w-4 h-4" /> {saving ? "Publishing…" : "Publish Now"}
                </Button>
              </>
            )}
          </div>

          {/* Keywords */}
          <Section title="Keywords & Tags" locked={isLive}>
            <Field label="Search Keywords" hint="comma-separated">
              <Textarea placeholder="e.g. oil painting, impressionism, landscape, 19th century…" value={form.keywords} onChange={e => set("keywords", e.target.value)} className="h-16" />
            </Field>
          </Section>
        </div>
      </div>
    </div>
  );
}