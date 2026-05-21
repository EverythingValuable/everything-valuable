import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, Upload, X, GripVertical, Lock, AlertTriangle,
  XCircle, Save, Rocket, Eye, Globe, EyeOff, Info
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CategoryFields from "../components/listing/CategoryFields";
import CustomFieldsEditor from "../components/listing/CustomFieldsEditor";
import ListingPreview from "../components/listing/ListingPreview";
import ListingChecklist from "../components/listing/ListingChecklist";
import DimensionsInput from "../components/listing/DimensionsInput";
import { MAIN_CATEGORIES } from "@/lib/categoryConfig";

const LIVE_STATUSES = ["first_bids", "prisometer", "pending_review"];
const UNSOLD_STATUS = "unsold";
const CONDITIONS = ["excellent", "very_good", "good", "fair", "as_is"];

// ─── UI Primitives ────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children, locked, badge }) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden",
      locked && "opacity-60 pointer-events-none"
    )}>
      <div className="px-6 py-5 border-b border-neutral-100 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {locked && <Lock className="w-3.5 h-3.5 text-amber-500" />}
            <h3 className="font-serif text-base font-semibold text-neutral-900">{title}</h3>
            {badge && <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-full">{badge}</span>}
          </div>
          {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-7 space-y-7">{children}</div>
    </div>
  );
}

function Field({ label, hint, required, children, visibility }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
          {label}{required && <span className="text-primary ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[11px] text-neutral-400">· {hint}</span>}
        {visibility === "public" && (
          <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full ml-auto">
            <Globe className="w-2.5 h-2.5" /> Public
          </span>
        )}
        {visibility === "private" && (
          <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-widest text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full ml-auto">
            <EyeOff className="w-2.5 h-2.5" /> Private
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function PriceInput({ value, onChange, placeholder, disabled }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">$</span>
      <Input
        type="number"
        className="pl-7 font-price text-base"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function ToggleButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl border text-xs font-semibold transition-all",
        active
          ? "border-primary bg-primary text-white shadow-sm"
          : "border-neutral-200 text-neutral-500 hover:border-neutral-400 bg-white"
      )}
    >
      {children}
    </button>
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
        "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all py-10 px-6 text-center",
        dragging ? "border-primary bg-primary/5" : "border-neutral-200 hover:border-primary/40 bg-neutral-50"
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
        <Upload className="w-5 h-5 text-neutral-500" />
      </div>
      <p className="font-semibold text-sm text-neutral-800">Drop photos here or click to browse</p>
      <p className="text-xs text-neutral-400 mt-1">JPEG, PNG, WEBP · Multiple files accepted</p>
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
          images: item.images || [],
          title: item.title || "", category: item.category || "",
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
          inventory_number: item.inventory_number || "",
          ownership_type: item.ownership_type || "owned",
          consignor_name: item.consignor_name || "", consignor_email: item.consignor_email || "",
          consignor_phone: item.consignor_phone || "", consignor_address: item.consignor_address || "",
          consignor_commission_percent: item.consignor_commission_percent || "",
          consignor_notes: item.consignor_notes || "",
          customer_location: item.customer_location || "",
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center space-y-4">
          <img src="https://media.base44.com/images/public/69beac1c3231aaeb891946d5/3a2676053_LOGOEV.png" alt="EV" className="h-10 w-auto mx-auto opacity-50" />
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const statusLabel = isLive ? "Live" : isUnsold ? "Unsold" : isEditMode ? "Draft" : "New Listing";

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex flex-col">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-5 md:px-8 h-16 flex items-center gap-4">
          {/* Logo + Back */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/seller" className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-700 transition-colors text-xs font-semibold">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Seller Dashboard</span>
            </Link>
            <div className="w-px h-5 bg-neutral-200" />
            <img
              src="https://media.base44.com/images/public/69beac1c3231aaeb891946d5/3a2676053_LOGOEV.png"
              alt="Everything Valuable"
              className="h-7 w-auto"
            />
          </div>

          {/* Title + status */}
          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            <div className="hidden sm:block w-px h-5 bg-neutral-200" />
            <p className="font-serif text-sm font-semibold text-neutral-700 truncate hidden sm:block">
              {form.title || "Untitled Listing"}
            </p>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shrink-0",
              isLive ? "bg-amber-100 text-amber-700" :
              isUnsold ? "bg-neutral-100 text-neutral-500" :
              "bg-neutral-100 text-neutral-500"
            )}>
              {statusLabel}
            </span>
            {isLive && (
              <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium hidden md:flex">
                <Lock className="w-3 h-3" /> Limited editing while live
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {editId && (
              <Link to={`/item/${editId}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs hidden md:flex border-neutral-300">
                  <Eye className="w-3.5 h-3.5" /> Preview Page
                </Button>
              </Link>
            )}
            {isLive && isEditMode && (
              <Button variant="outline" size="sm" onClick={() => setCancelConfirm(true)}
                className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/5">
                <XCircle className="w-3.5 h-3.5" /> Cancel Sale
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={saveDraft} disabled={saving}
              className="gap-1.5 text-xs border-neutral-300">
              <Save className="w-3.5 h-3.5" /> Save Draft
            </Button>
            {!isLive && (
              <Button size="sm" onClick={isUnsold ? relistNow : publishNow}
                disabled={saving || !form.title || !form.prisometer_start_price}
                className="gap-1.5 text-xs bg-primary hover:bg-primary/90 font-bold px-4">
                <Rocket className="w-3.5 h-3.5" />
                {saving ? "Publishing…" : isUnsold ? "Relist Now" : "Publish Listing"}
              </Button>
            )}
            {isLive && (
              <Button size="sm" onClick={saveDraft} disabled={saving}
                className="gap-1.5 text-xs bg-primary hover:bg-primary/90 font-bold px-4">
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Cancel Confirm Modal ─────────────────────────────────────────── */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCancelConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Cancel this listing?</h3>
                <p className="text-xs text-neutral-500 mt-1">This will end the sale immediately. All watchers and bidders will be notified.</p>
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

      {/* ── Main split layout ────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 md:px-8 py-6 grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">

        {/* ── LEFT: Builder Form ─────────────────────────────────────────── */}
        <div className="space-y-5 min-w-0">

          {/* 1. Photos */}
          <SectionCard title="Photos" subtitle="First photo is used as the cover image">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Tips for great photos</p>
              <ul className="text-xs text-emerald-800 space-y-0.5 list-disc list-inside">
                <li>Recommended size: <strong>2000 × 2000 px</strong> minimum — square crops work best</li>
                <li>Use natural, diffused light — avoid harsh flash or deep shadows</li>
                <li>Shoot on a clean, neutral background (white, grey, or linen)</li>
                <li>Include detail shots: signatures, hallmarks, damage, texture</li>
                <li>First photo becomes the cover — make it your strongest image</li>
              </ul>
            </div>
            <DropZone onFiles={handleImageUpload} />
            {uploadingImages && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 animate-pulse">
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                Uploading photos…
              </div>
            )}
            {form.images.length > 0 && (
              <div>
                <p className="text-xs text-neutral-400 mb-3 flex items-center gap-1.5">
                  <GripVertical className="w-3.5 h-3.5" /> Drag to reorder · First image is cover
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
                                  "relative w-24 h-24 rounded-xl overflow-hidden border-2 group",
                                  i === 0 ? "border-primary" : "border-neutral-200",
                                  snapshot.isDragging && "shadow-xl scale-105 z-10"
                                )}
                              >
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <div {...drag.dragHandleProps} className="absolute top-1.5 left-1.5 bg-black/50 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                                  <GripVertical className="w-3 h-3" />
                                </div>
                                {i === 0 && <div className="absolute bottom-1.5 left-1.5 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">Cover</div>}
                                <button onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
          </SectionCard>

          {/* 2. Listing Basics */}
          <SectionCard title="Listing Basics" locked={isLive}>

            {/* Title */}
            <div className="space-y-2">
              <Field label="Title" required>
                <Input
                  className="text-base font-serif h-12"
                  placeholder="e.g. Fernand Léger — Composition with Figures, 1928"
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                />
              </Field>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">Tips for a great title</p>
                <ul className="text-xs text-amber-800 space-y-0.5 list-disc list-inside">
                  <li>Lead with Artist / Maker name if known (e.g. "Henri Matisse — …")</li>
                  <li>Include medium or material (Oil on canvas, Bronze, Sterling Silver…)</li>
                  <li>Add date or period ("circa 1920s", "Art Deco, 1935")</li>
                  <li>Keep it under 80 characters for best search visibility</li>
                </ul>
              </div>
            </div>

            {/* Category + Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <Field label="Category" required>
                <select value={form.category} onChange={e => { set("category", e.target.value); set("subcategory", ""); set("style", ""); }}
                  className="w-full h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select category…</option>
                  {MAIN_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Condition">
                <select value={form.condition} onChange={e => set("condition", e.target.value)}
                  className="w-full h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </Field>
            </div>

            {/* Dimensions + Marks */}
            <div className="space-y-5">
              <Field label="Dimensions">
                <DimensionsInput value={form.dimensions} onChange={v => set("dimensions", v)} />
              </Field>
              <Field label="Marks / Signatures">
                <Input placeholder="e.g. Signed lower right in pencil" value={form.marks} onChange={e => set("marks", e.target.value)} />
              </Field>
            </div>

            {/* Category-specific fields (includes maker, period, origin, materials, etc.) */}
            {form.category && (
              <div className="pt-2">
                <CategoryFields form={form} set={set} />
              </div>
            )}
          </SectionCard>

          {/* 3. Auction Presentation */}
          <SectionCard title="Auction Presentation" subtitle="Compelling descriptions drive buyer engagement">
            <Field label="Short Summary" hint="shown in search results & cards">
              <Textarea
                placeholder="A compelling one or two sentence overview for search results…"
                value={form.short_description}
                onChange={e => set("short_description", e.target.value)}
                className="h-16 resize-none"
              />
            </Field>
            <div className="space-y-2">
              <Field label="Full Description">
                <Textarea
                  placeholder="Describe the work in detail — style, context, significance, visual qualities, historical importance…"
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  className="h-40 resize-none"
                />
              </Field>
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700">Tips for a compelling description</p>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>What makes this piece unique or special?</li>
                  <li>Why is it worth the price? What is its background or history?</li>
                  <li>How would you describe it to someone who hasn't seen it in person?</li>
                  <li>Add keywords early — search engines favor the first few sentences</li>
                  <li>Do not include shipping or contact information here</li>
                </ul>
              </div>
            </div>
            <Field label="Condition Report">
              <Textarea
                placeholder="Detail any wear, restoration, or damage. Honest reporting builds buyer confidence…"
                value={form.condition_notes}
                onChange={e => set("condition_notes", e.target.value)}
                className="h-24 resize-none"
              />
            </Field>
            <Field label="Provenance">
              <Textarea
                placeholder="e.g. Private collection, Paris; acquired directly from the artist in 1974; thence by descent…"
                value={form.provenance}
                onChange={e => set("provenance", e.target.value)}
                className="h-20 resize-none"
              />
            </Field>
            <Field label="Auction Terms & Conditions" hint="optional override">
              <Textarea
                placeholder="Payment due within 7 days. All sales final. Buyer responsible for shipping…"
                value={form.terms_and_conditions}
                onChange={e => set("terms_and_conditions", e.target.value)}
                className="h-20 resize-none"
              />
            </Field>
          </SectionCard>

          {/* 4. Pricing & PRI$OMETER */}
          <SectionCard
            title="Pricing & PRI$OMETER™ Setup"
            subtitle="Configure your auction parameters"
            locked={isLive}
            badge="Auction Config"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Estimate Low">
                <PriceInput placeholder="e.g. 8,000" value={form.estimated_low} onChange={e => set("estimated_low", e.target.value)} />
              </Field>
              <Field label="Estimate High">
                <PriceInput placeholder="e.g. 12,000" value={form.estimated_high} onChange={e => set("estimated_high", e.target.value)} />
              </Field>
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Visible Start Price" required hint="shown to buyers">
                  <PriceInput placeholder="e.g. 5,000" value={form.prisometer_start_price} onChange={e => set("prisometer_start_price", e.target.value)} />
                </Field>
                <Field label="Hidden Reserve Price" hint="never shown to buyers">
                  <PriceInput placeholder="e.g. 9,000" value={form.reserve_price} onChange={e => set("reserve_price", e.target.value)} />
                </Field>
              </div>
            </div>

            {floorPrice && (
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-600">
                <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                Price floor at {form.below_reserve_percent}% below reserve:
                <span className="font-bold text-neutral-900 ml-auto">${Number(floorPrice).toLocaleString()}</span>
              </div>
            )}

            <Field label="Below-Reserve Drop Allowance" hint="how far below reserve the price can fall">
              <div className="flex gap-2">
                {[10, 15, 20].map(pct => (
                  <ToggleButton key={pct} active={form.below_reserve_percent === pct} onClick={() => set("below_reserve_percent", pct)}>
                    {pct}%
                  </ToggleButton>
                ))}
              </div>
            </Field>

            <Field label="1stBid$™ Preview Duration">
              <div className="flex gap-2">
                {[{ h: 168, label: "7 days" }, { h: 336, label: "14 days" }, { h: 720, label: "30 days" }].map(({ h, label }) => (
                  <ToggleButton key={h} active={form.first_bids_duration_hours === h} onClick={() => set("first_bids_duration_hours", h)}>
                    {label}
                  </ToggleButton>
                ))}
              </div>
            </Field>

            <Field label="PRI$OMETER™ Live Duration">
              <div className="flex gap-2">
                {[{ h: 168, label: "7 days" }, { h: 336, label: "14 days" }, { h: 504, label: "21 days" }].map(({ h, label }) => (
                  <ToggleButton key={h} active={form.prisometer_duration_hours === h} onClick={() => set("prisometer_duration_hours", h)}>
                    {label}
                  </ToggleButton>
                ))}
              </div>
            </Field>

            <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs font-bold text-neutral-800">Make It Mine™</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Buyers can purchase at your asking price. Always visible.</p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">Always On</span>
            </div>
          </SectionCard>

          {/* 5. Inventory & Logistics */}
          <SectionCard title="Inventory & Logistics" subtitle="Internal tracking and logistics details">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Inventory Number" visibility="private">
                <Input placeholder="e.g. EV-2024-001" value={form.inventory_number} onChange={e => set("inventory_number", e.target.value)} />
              </Field>
              <Field label="Internal Storage Location" visibility="private">
                <Input placeholder="e.g. Warehouse B, Shelf 3" value={form.location} onChange={e => set("location", e.target.value)} />
              </Field>
              <Field label="Public Item Location" visibility="public">
                <Input placeholder="e.g. New York, NY" value={form.customer_location} onChange={e => set("customer_location", e.target.value)} />
              </Field>
            </div>
            <Field label="Shipping Notes" visibility="public">
              <Textarea
                placeholder="Packaging, fragility, shipping requirements, pickup availability…"
                value={form.shipping_notes}
                onChange={e => set("shipping_notes", e.target.value)}
                className="h-20 resize-none"
              />
            </Field>
            <Field label="Search Keywords" hint="comma-separated, improves discoverability" visibility="private">
              <Textarea
                placeholder="e.g. oil painting, impressionism, landscape, 19th century…"
                value={form.keywords}
                onChange={e => set("keywords", e.target.value)}
                className="h-14 resize-none"
              />
            </Field>

            {/* Ownership */}
            <div className="border-t border-neutral-100 pt-5">
              <Field label="Ownership Type">
                <div className="flex gap-2">
                  {[["owned", "Self-Owned"], ["consignment", "Consignment"]].map(([val, label]) => (
                    <ToggleButton key={val} active={form.ownership_type === val} onClick={() => set("ownership_type", val)}>
                      {label}
                    </ToggleButton>
                  ))}
                </div>
              </Field>
            </div>

            {form.ownership_type === "consignment" && (
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-neutral-400">Consignor Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                    </div>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Consignor Address">
                      <Input placeholder="Street, City, State, ZIP" value={form.consignor_address} onChange={e => set("consignor_address", e.target.value)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Consignment Notes" hint="agreement terms, special instructions">
                      <Textarea placeholder="Payment terms, pickup/drop-off, special conditions…" value={form.consignor_notes} onChange={e => set("consignor_notes", e.target.value)} className="h-20 resize-none" />
                    </Field>
                  </div>
                </div>
                {form.consignor_commission_percent && form.prisometer_start_price && (
                  <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-xs text-violet-700">
                    <p className="font-semibold">Estimated consignor payout at start price</p>
                    <p className="mt-0.5">${(form.prisometer_start_price * (1 - form.consignor_commission_percent / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({100 - +form.consignor_commission_percent}% of ${(+form.prisometer_start_price).toLocaleString()})</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Custom Fields */}
          <SectionCard title="Custom Tracking Fields" subtitle="Internal fields saved to your profile template">
            <CustomFieldsEditor fields={form.custom_fields} onChange={handleCustomFieldsChange} />
          </SectionCard>
        </div>

        {/* ── RIGHT: Sticky Preview + Checklist ─────────────────────────── */}
        <div className="hidden xl:flex flex-col gap-5">
          <div className="sticky top-24 flex flex-col gap-5 max-h-[calc(100vh-7rem)] overflow-hidden">
            <ListingChecklist form={form} />
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">Live Buyer Preview</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <ListingPreview form={form} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}