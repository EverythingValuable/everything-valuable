import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, Upload, X, GripVertical, Lock, AlertTriangle,
  XCircle, Save, Rocket, Eye, EyeOff, Globe, Info, ArrowLeft
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CategoryFields from "../components/listing/CategoryFields";
import CustomFieldsEditor from "../components/listing/CustomFieldsEditor";
import DimensionsInput from "../components/listing/DimensionsInput";
import CategoryPickerModal from "../components/listing/CategoryPickerModal";
import AIListingAssistant from "../components/listing/AIListingAssistant";
import { MAIN_CATEGORIES } from "@/lib/categoryConfig";

const LIVE_STATUSES = ["first_bids", "prisometer", "pending_review"];
const UNSOLD_STATUS = "unsold";
const CONDITIONS = ["excellent", "very_good", "good", "fair", "as_is"];

// ─── Minimal UI Primitives ────────────────────────────────────────────────────

function Section({ title, subtitle, children, locked, badge }) {
  return (
    <div className={cn("border-b border-neutral-100 pb-12", locked && "opacity-50 pointer-events-none")}>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          {locked && <Lock className="w-3 h-3 text-neutral-400" />}
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-900">{title}</h2>
          {badge && <span className="text-[9px] tracking-[0.15em] uppercase border border-neutral-300 text-neutral-500 px-2 py-0.5">{badge}</span>}
        </div>
        {subtitle && <p className="text-xs text-neutral-400 mt-1.5 tracking-wide">{subtitle}</p>}
      </div>
      <div className="space-y-8">{children}</div>
    </div>
  );
}

function Field({ label, hint, required, children, visibility }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-500">
          {label}{required && <span className="text-neutral-900 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[10px] text-neutral-300 tracking-wide">/ {hint}</span>}
        {visibility === "public" && (
          <span className="flex items-center gap-0.5 text-[9px] tracking-[0.12em] uppercase text-neutral-400 ml-auto">
            <Globe className="w-2.5 h-2.5" /> Public
          </span>
        )}
        {visibility === "private" && (
          <span className="flex items-center gap-0.5 text-[9px] tracking-[0.12em] uppercase text-neutral-300 ml-auto">
            <EyeOff className="w-2.5 h-2.5" /> Private
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

const inputClass = "w-full h-10 border-0 border-b border-neutral-200 bg-transparent px-0 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors rounded-none";
const textareaClass = "w-full border-0 border-b border-neutral-200 bg-transparent px-0 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors rounded-none resize-none";

function MinInput(props) {
  return <input className={cn(inputClass, props.className)} {...props} />;
}

function MinTextarea(props) {
  return <textarea className={cn(textareaClass, "py-2", props.className)} {...props} />;
}

function PriceInput({ value, onChange, placeholder, disabled }) {
  return (
    <div className="relative">
      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-300 text-sm">$</span>
      <input
        type="number"
        className={cn(inputClass, "pl-4 font-mono")}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function Toggle({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase border transition-all",
        active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-400 hover:border-neutral-400"
      )}
    >
      {children}
    </button>
  );
}

function DropZone({ onFiles }) {
  const [dragging, setDragging] = useState(false);
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files);
  }, [onFiles]);
  return (
    <label
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center justify-center border border-dashed cursor-pointer transition-all py-12 px-6 text-center",
        dragging ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"
      )}
    >
      <Upload className="w-5 h-5 text-neutral-300 mb-3" />
      <p className="text-xs font-medium text-neutral-500 tracking-wide">Drop photos or click to browse</p>
      <p className="text-[10px] text-neutral-300 mt-1 tracking-widest uppercase">JPEG · PNG · WEBP</p>
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
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const isLive = LIVE_STATUSES.includes(itemStatus);
  const isUnsold = itemStatus === UNSOLD_STATUS;

  const [form, setForm] = useState({
    images: [], title: "", category: "", subcategory: "", maker: "",
    period: "", style: "", technique: "", keywords: "",
    materials: "", dimensions: "", origin: "", location: "",
    model: "", movement_type: "", running_status: "",
    metal_purity: "", stone_type: "", ring_size: "", length: "",
    condition: "very_good", provenance: "",
    description: "", short_description: "", condition_notes: "",
    shipping_notes: "", marks: "", terms_and_conditions: "",
    first_bids_duration_hours: 168, prisometer_start_price: "",
    reserve_price: "", below_reserve_percent: 10,
    prisometer_duration_hours: 168,
    estimated_low: "", estimated_high: "",
    internal_notes: "", custom_fields: [],
    inventory_number: "", ownership_type: "owned",
    consignor_name: "", consignor_email: "", consignor_phone: "",
    consignor_address: "", consignor_commission_percent: "",
    consignor_notes: "", customer_location: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
        const template = profile?.listing_custom_fields_template || [];
        let storedValues = {};
        try {
          const parsed = JSON.parse(item.internal_notes || "{}");
          (parsed.custom_fields || []).forEach(f => { storedValues[f.label] = f.value; });
        } catch {}
        const customFields = template.map(f => ({ ...f, value: storedValues[f.label] ?? "" }));
        setForm({
          images: item.images || [], title: item.title || "", category: item.category || "",
          subcategory: item.subcategory || "", maker: item.maker || "",
          period: item.period || "", style: item.style || "",
          technique: item.technique || "", keywords: item.keywords || "",
          materials: item.materials || "", dimensions: item.dimensions || "",
          origin: item.origin || "", location: item.location || profiles[0]?.location || "",
          model: item.model || "", movement_type: item.movement_type || "",
          running_status: item.running_status || "", metal_purity: item.metal_purity || "",
          stone_type: item.stone_type || "", ring_size: item.ring_size || "",
          length: item.length || "", condition: item.condition || "very_good",
          provenance: item.provenance || "", description: item.description || "",
          short_description: item.short_description || "", condition_notes: item.condition_notes || "",
          shipping_notes: item.shipping_notes || "", marks: item.marks || "",
          terms_and_conditions: item.terms_and_conditions || "",
          first_bids_duration_hours: item.first_bids_duration_hours || 168,
          prisometer_start_price: item.prisometer_start_price || "",
          reserve_price: item.reserve_price || "",
          below_reserve_percent: item.below_reserve_percent || 10,
          prisometer_duration_hours: item.prisometer_duration_hours || 168,
          estimated_low: item.estimated_low || "", estimated_high: item.estimated_high || "",
          internal_notes: item.internal_notes || "", custom_fields: customFields,
          inventory_number: item.inventory_number || "", ownership_type: item.ownership_type || "owned",
          consignor_name: item.consignor_name || "", consignor_email: item.consignor_email || "",
          consignor_phone: item.consignor_phone || "", consignor_address: item.consignor_address || "",
          consignor_commission_percent: item.consignor_commission_percent || "",
          consignor_notes: item.consignor_notes || "", customer_location: item.customer_location || "",
        });
      } else {
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
          images: form.images, category: form.category, subcategory: form.subcategory || undefined,
          style: form.style || undefined, maker: form.maker || undefined, period: form.period || undefined,
          technique: form.technique || undefined, description: form.description,
          short_description: form.short_description, condition: form.condition,
          condition_notes: form.condition_notes, shipping_notes: form.shipping_notes,
          internal_notes: JSON.stringify({ custom_fields: form.custom_fields }),
          inventory_number: form.inventory_number || undefined,
          location: form.location || undefined, customer_location: form.customer_location || undefined,
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
      status: "first_bids", first_bids_start: now.toISOString(), first_bids_end: firstBidsEnd.toISOString(),
      highest_bid: 0, bid_count: 0, sold_price: null, sold_to_email: null, sold_via: null,
      make_it_mine_active: false, make_it_mine_expires: null,
      prisometer_activated_at: null, current_price: +form.prisometer_start_price || 0,
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

  const floorPrice = form.reserve_price && form.below_reserve_percent
    ? (form.reserve_price * (1 - form.below_reserve_percent / 100)).toFixed(0)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-5 h-5 border border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  const statusLabel = isLive ? "Live" : isUnsold ? "Unsold" : isEditMode ? "Draft" : "New";

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-14 flex items-center gap-6">
          <Link to="/seller" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase">Dashboard</span>
          </Link>

          <div className="w-px h-4 bg-neutral-100" />

          <div className="flex-1 flex items-center gap-3 min-w-0">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-300 shrink-0">
              Listing Studio
            </span>
            {form.title && (
              <>
                <span className="text-neutral-200">/</span>
                <span className="text-xs text-neutral-500 truncate">{form.title}</span>
              </>
            )}
            <span className={cn(
              "text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 border shrink-0",
              isLive ? "border-neutral-900 text-neutral-900" : "border-neutral-200 text-neutral-300"
            )}>
              {statusLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {editId && (
              <Link to={`/item/${editId}`} target="_blank"
                className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors">
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </Link>
            )}
            {isLive && isEditMode && (
              <button onClick={() => setCancelConfirm(true)}
                className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Cancel Sale
              </button>
            )}
            <button onClick={saveDraft} disabled={saving}
              className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving…" : "Save Draft"}
            </button>
            {!isLive && (
              <button
                onClick={isUnsold ? relistNow : publishNow}
                disabled={saving || !form.title || !form.prisometer_start_price}
                className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-[10px] font-bold tracking-[0.18em] uppercase px-5 py-2.5 transition-colors disabled:opacity-30"
              >
                <Rocket className="w-3.5 h-3.5" />
                {saving ? "Publishing…" : isUnsold ? "Relist" : "Publish"}
              </button>
            )}
            {isLive && (
              <button onClick={saveDraft} disabled={saving}
                className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-[10px] font-bold tracking-[0.18em] uppercase px-5 py-2.5 transition-colors">
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      {categoryPickerOpen && (
        <CategoryPickerModal
          value={form.category}
          subcategory={form.subcategory}
          onSave={(cat, sub) => { set("category", cat); set("subcategory", sub || ""); set("style", ""); }}
          onClose={() => setCategoryPickerOpen(false)}
        />
      )}

      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setCancelConfirm(false)}>
          <div className="bg-white p-8 max-w-sm w-full mx-4 space-y-6" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-sm font-bold tracking-wide mb-2">Cancel this listing?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">This will end the sale immediately. All watchers and bidders will be notified.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={cancelSale} disabled={saving}
                className="flex-1 bg-neutral-900 text-white text-[10px] font-bold tracking-[0.15em] uppercase py-3 hover:bg-black transition-colors">
                {saving ? "Cancelling…" : "Yes, Cancel"}
              </button>
              <button onClick={() => setCancelConfirm(false)}
                className="flex-1 border border-neutral-200 text-[10px] font-bold tracking-[0.15em] uppercase py-3 text-neutral-500 hover:border-neutral-400 transition-colors">
                Keep Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-12 py-12 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-16">

        {/* ── LEFT: Form ────────────────────────────────────────────────── */}
        <div className="space-y-12 min-w-0">

          {/* 01 · Photos */}
          <Section title="01 · Photos" subtitle="First photo becomes the cover image">
            <DropZone onFiles={handleImageUpload} />
            {uploadingImages && (
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <div className="w-3.5 h-3.5 border border-neutral-200 border-t-neutral-500 rounded-full animate-spin" />
                Uploading…
              </div>
            )}
            {form.images.length > 0 && (
              <div>
                <p className="text-[10px] text-neutral-300 mb-4 tracking-widest uppercase flex items-center gap-1.5">
                  <GripVertical className="w-3 h-3" /> Drag to reorder
                </p>
                <DragDropContext onDragEnd={({ source, destination }) => {
                  if (!destination || source.index === destination.index) return;
                  const imgs = [...form.images];
                  const [moved] = imgs.splice(source.index, 1);
                  imgs.splice(destination.index, 0, moved);
                  set("images", imgs);
                }}>
                  <Droppable droppableId="images" direction="horizontal">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-3 flex-wrap">
                        {form.images.map((url, i) => (
                          <Draggable key={url + i} draggableId={`img-${i}`} index={i}>
                            {(drag, snapshot) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                className={cn(
                                  "relative w-24 h-24 overflow-hidden border group",
                                  i === 0 ? "border-neutral-900" : "border-neutral-100",
                                  snapshot.isDragging && "shadow-xl"
                                )}
                              >
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <div {...drag.dragHandleProps} className="absolute top-1 left-1 bg-white/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                                  <GripVertical className="w-2.5 h-2.5 text-neutral-500" />
                                </div>
                                {i === 0 && <div className="absolute bottom-1 left-1 bg-neutral-900 text-white text-[8px] px-1.5 py-0.5 tracking-widest uppercase">Cover</div>}
                                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white/80 text-neutral-700 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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

          {/* 02 · Basics */}
          <Section title="02 · Item Details" locked={isLive}>
            <Field label="Title" required>
              <MinInput
                className="text-lg tracking-tight font-medium h-12"
                placeholder="e.g. Fernand Léger — Composition, 1928"
                value={form.title}
                onChange={e => set("title", e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <Field label="Category" required>
                <button
                  type="button"
                  onClick={() => setCategoryPickerOpen(true)}
                  className="w-full h-10 border-0 border-b border-neutral-200 bg-transparent text-sm text-left flex items-center justify-between gap-2 hover:border-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                >
                  <span className={form.category ? "text-neutral-900" : "text-neutral-300"}>
                    {form.category
                      ? [MAIN_CATEGORIES.find(c => c.value === form.category)?.label, form.subcategory].filter(Boolean).join(" › ")
                      : "Select category…"}
                  </span>
                  <ChevronLeft className="w-3.5 h-3.5 text-neutral-300 rotate-180 shrink-0" />
                </button>
              </Field>

              <Field label="Condition">
                <select value={form.condition} onChange={e => set("condition", e.target.value)}
                  className="w-full h-10 border-0 border-b border-neutral-200 bg-transparent text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors appearance-none">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Dimensions">
              <DimensionsInput value={form.dimensions} onChange={v => set("dimensions", v)} />
            </Field>

            <Field label="Marks / Signatures">
              <MinInput placeholder="e.g. Signed lower right in pencil" value={form.marks} onChange={e => set("marks", e.target.value)} />
            </Field>

            {form.category && (
              <div className="pt-2">
                <CategoryFields form={form} set={set} />
              </div>
            )}
          </Section>

          {/* 03 · Presentation */}
          <Section title="03 · Description & Presentation">
            <Field label="Short Summary" hint="shown in search results">
              <MinTextarea
                placeholder="A compelling one-two sentence overview…"
                value={form.short_description}
                onChange={e => set("short_description", e.target.value)}
                className="h-16"
              />
            </Field>
            <Field label="Full Description">
              <MinTextarea
                placeholder="Describe the work in detail — style, context, significance, visual qualities…"
                value={form.description}
                onChange={e => set("description", e.target.value)}
                className="h-40"
              />
            </Field>
            <Field label="Condition Report">
              <MinTextarea
                placeholder="Detail any wear, restoration, or damage…"
                value={form.condition_notes}
                onChange={e => set("condition_notes", e.target.value)}
                className="h-20"
              />
            </Field>
            <Field label="Provenance">
              <MinTextarea
                placeholder="e.g. Private collection, Paris; acquired directly from the artist in 1974…"
                value={form.provenance}
                onChange={e => set("provenance", e.target.value)}
                className="h-20"
              />
            </Field>
            <Field label="Terms & Conditions" hint="optional override">
              <MinTextarea
                placeholder="Payment due within 7 days. All sales final…"
                value={form.terms_and_conditions}
                onChange={e => set("terms_and_conditions", e.target.value)}
                className="h-20"
              />
            </Field>
          </Section>

          {/* 04 · Pricing */}
          <Section title="04 · Pricing & Auction" locked={isLive} badge="Auction Config">
            <div className="grid grid-cols-2 gap-8">
              <Field label="Estimate Low">
                <PriceInput placeholder="8,000" value={form.estimated_low} onChange={e => set("estimated_low", e.target.value)} />
              </Field>
              <Field label="Estimate High">
                <PriceInput placeholder="12,000" value={form.estimated_high} onChange={e => set("estimated_high", e.target.value)} />
              </Field>
              <Field label="Prisometer Price" required hint="shown to buyers">
                <PriceInput placeholder="5,000" value={form.prisometer_start_price} onChange={e => set("prisometer_start_price", e.target.value)} />
              </Field>
              <Field label="Hidden Reserve Price" hint="never shown to buyers">
                <PriceInput placeholder="9,000" value={form.reserve_price} onChange={e => set("reserve_price", e.target.value)} />
              </Field>
            </div>

            {floorPrice && (
              <div className="flex items-center gap-2 border-l-2 border-neutral-200 pl-4 text-xs text-neutral-400">
                <Info className="w-3.5 h-3.5 shrink-0" />
                Price floor at {form.below_reserve_percent}% below reserve:
                <span className="font-bold text-neutral-700 ml-1">${Number(floorPrice).toLocaleString()}</span>
              </div>
            )}

            <Field label="Below-Reserve Drop Allowance">
              <div className="flex gap-2 mt-1">
                {[10, 15, 20].map(pct => (
                  <Toggle key={pct} active={form.below_reserve_percent === pct} onClick={() => set("below_reserve_percent", pct)}>
                    {pct}%
                  </Toggle>
                ))}
              </div>
            </Field>

            <Field label="1stBids™ Preview Duration">
              <div className="flex gap-2 mt-1">
                {[{ h: 168, label: "7 days" }, { h: 336, label: "14 days" }, { h: 720, label: "30 days" }].map(({ h, label }) => (
                  <Toggle key={h} active={form.first_bids_duration_hours === h} onClick={() => set("first_bids_duration_hours", h)}>
                    {label}
                  </Toggle>
                ))}
              </div>
            </Field>

            <Field label="Prisometer™ Live Duration">
              <div className="flex gap-2 mt-1">
                {[{ h: 168, label: "7 days" }, { h: 336, label: "14 days" }, { h: 504, label: "21 days" }].map(({ h, label }) => (
                  <Toggle key={h} active={form.prisometer_duration_hours === h} onClick={() => set("prisometer_duration_hours", h)}>
                    {label}
                  </Toggle>
                ))}
              </div>
            </Field>

            <div className="flex items-center justify-between border-t border-neutral-100 pt-6">
              <div>
                <p className="text-xs font-bold tracking-wide text-neutral-700">Make It Mine™</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Buyers can purchase at your asking price.</p>
              </div>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400">Always On</span>
            </div>
          </Section>

          {/* 05 · Logistics */}
          <Section title="05 · Inventory & Logistics">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <Field label="Inventory Number" visibility="private">
                <MinInput placeholder="EV-2024-001" value={form.inventory_number} onChange={e => set("inventory_number", e.target.value)} />
              </Field>
              <Field label="Internal Location" visibility="private">
                <MinInput placeholder="Warehouse B, Shelf 3" value={form.location} onChange={e => set("location", e.target.value)} />
              </Field>
              <Field label="Public Item Location" visibility="public">
                <MinInput placeholder="New York, NY" value={form.customer_location} onChange={e => set("customer_location", e.target.value)} />
              </Field>
            </div>
            <Field label="Shipping Notes" visibility="public">
              <MinTextarea
                placeholder="Packaging, fragility, pickup availability…"
                value={form.shipping_notes}
                onChange={e => set("shipping_notes", e.target.value)}
                className="h-20"
              />
            </Field>
            <Field label="Search Keywords" hint="comma-separated" visibility="private">
              <MinTextarea
                placeholder="oil painting, impressionism, landscape, 19th century…"
                value={form.keywords}
                onChange={e => set("keywords", e.target.value)}
                className="h-14"
              />
            </Field>

            <div className="border-t border-neutral-100 pt-6">
              <Field label="Ownership Type">
                <div className="flex gap-2 mt-1">
                  {[["owned", "Self-Owned"], ["consignment", "Consignment"]].map(([val, label]) => (
                    <Toggle key={val} active={form.ownership_type === val} onClick={() => set("ownership_type", val)}>
                      {label}
                    </Toggle>
                  ))}
                </div>
              </Field>
            </div>

            {form.ownership_type === "consignment" && (
              <div className="space-y-6 pt-4 border-t border-neutral-100">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-300">Consignor Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Field label="Consignor Name" required>
                    <MinInput placeholder="Full name" value={form.consignor_name} onChange={e => set("consignor_name", e.target.value)} />
                  </Field>
                  <Field label="Consignor Email">
                    <MinInput type="email" placeholder="email@example.com" value={form.consignor_email} onChange={e => set("consignor_email", e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <MinInput placeholder="+1 (555) 000-0000" value={form.consignor_phone} onChange={e => set("consignor_phone", e.target.value)} />
                  </Field>
                  <Field label="Commission %" hint="seller keeps">
                    <div className="relative">
                      <MinInput type="number" placeholder="30" value={form.consignor_commission_percent} onChange={e => set("consignor_commission_percent", e.target.value)} className="pr-5" />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-300 text-sm">%</span>
                    </div>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Consignor Address">
                      <MinInput placeholder="Street, City, State, ZIP" value={form.consignor_address} onChange={e => set("consignor_address", e.target.value)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Consignment Notes">
                      <MinTextarea placeholder="Payment terms, pickup/drop-off, special conditions…" value={form.consignor_notes} onChange={e => set("consignor_notes", e.target.value)} className="h-20" />
                    </Field>
                  </div>
                </div>
                {form.consignor_commission_percent && form.prisometer_start_price && (
                  <div className="border-l-2 border-neutral-200 pl-4 text-xs text-neutral-400">
                    Estimated consignor payout at start price:
                    <span className="font-bold text-neutral-700 ml-2">${(form.prisometer_start_price * (1 - form.consignor_commission_percent / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className="text-neutral-300 ml-1">({100 - +form.consignor_commission_percent}% of ${(+form.prisometer_start_price).toLocaleString()})</span>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* 06 · Custom Fields */}
          <Section title="06 · Custom Tracking Fields" subtitle="Internal fields saved to your profile template">
            <CustomFieldsEditor fields={form.custom_fields} onChange={handleCustomFieldsChange} />
          </Section>
        </div>

        {/* ── RIGHT: AI Assistant ────────────────────────────────────────── */}
        <div className="hidden xl:flex flex-col">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide space-y-4 pb-4">
            <AIListingAssistant
              form={form}
              onApply={(field, value) => set(field, value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}