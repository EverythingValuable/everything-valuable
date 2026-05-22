import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, Upload, X, GripVertical, Lock,
  XCircle, Save, Rocket, Eye, EyeOff, Globe, Info, ArrowLeft, Trash2, Wand2, Loader2
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CategoryFields from "../components/listing/CategoryFields";
import CustomFieldsEditor from "../components/listing/CustomFieldsEditor";
import DimensionsInput from "../components/listing/DimensionsInput";
import CategoryPickerModal from "../components/listing/CategoryPickerModal";
import AIListingAssistant from "../components/listing/AIListingAssistant";
import ThemeCustomizer from "../components/listing/ThemeCustomizer";
import { MAIN_CATEGORIES } from "@/lib/categoryConfig";

const THEMES = {
  minimal: { light: { bg: "#faf9f7", text: "#1a1a1a", primary: "#d63859" }, dark: { bg: "#0f0e0d", text: "#f5f5f5", primary: "#ff4081" } },
  warm: { light: { bg: "#fef5f1", text: "#3a2520", primary: "#c85a54" }, dark: { bg: "#1a0f0a", text: "#fbe8e0", primary: "#e8956a" } },
  modern: { light: { bg: "#f0f4f8", text: "#1a2a3a", primary: "#0066cc" }, dark: { bg: "#0a1628", text: "#e8f0ff", primary: "#4d94ff" } },
  classic: { light: { bg: "#fffbf5", text: "#2c2c2c", primary: "#8b5a3c" }, dark: { bg: "#1a1410", text: "#f5f1ec", primary: "#d4a574" } }
};

const LIVE_STATUSES = ["first_bids", "prisometer", "pending_review"];
const CONDITIONS = ["excellent", "very_good", "good", "fair", "as_is"];

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionHeader({ number, title, subtitle, locked, badge, darkMode }) {
  return (
    <div className="mb-8 flex items-start gap-5">
      <span className="font-serif text-[64px] leading-none select-none tabular-nums" style={{color: darkMode ? '#444' : '#e8e4df'}}>{number}</span>
      <div className="pt-3">
        <div className="flex items-center gap-3">
          {locked && <Lock className="w-3.5 h-3.5" style={{color: darkMode ? '#666' : '#999'}} />}
          <h2 className="text-base font-bold tracking-[0.15em] uppercase" style={{color: darkMode ? '#e8e8e8' : '#222'}}>{title}</h2>
          {badge && (
            <span className="text-[10px] tracking-[0.12em] uppercase border px-2.5 py-1" style={{borderColor: darkMode ? '#555' : '#ddd', color: darkMode ? '#aaa' : '#666'}}>{badge}</span>
          )}
        </div>
        {subtitle && <p className="text-sm mt-1 leading-snug" style={{color: darkMode ? '#aaa' : '#999'}}>{subtitle}</p>}
      </div>
    </div>
  );
}

function Section({ number, title, subtitle, children, locked, badge, themeColors, darkMode }) {
  return (
    <div
      id={`section-${number}`}
      className={cn(
        "border shadow-sm px-10 py-10 rounded-lg",
        locked && "opacity-50 pointer-events-none"
      )}
      style={{
        backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
        borderColor: darkMode ? "#333" : "#ddd"
      }}
    >
      <SectionHeader number={number} title={title} subtitle={subtitle} locked={locked} badge={badge} />
      <div className="space-y-8">{children}</div>
    </div>
  );
}

function Field({ label, hint, required, children, visibility }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs font-bold tracking-[0.18em] uppercase text-neutral-500">
          {label}{required && <span className="text-neutral-800 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-xs text-neutral-400">/ {hint}</span>}
        {visibility === "public" && (
          <span className="flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase text-neutral-400 ml-auto">
            <Globe className="w-3 h-3" /> Public
          </span>
        )}
        {visibility === "private" && (
          <span className="flex items-center gap-1 text-[10px] tracking-[0.12em] uppercase text-neutral-300 ml-auto">
            <EyeOff className="w-3 h-3" /> Internal
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

const lineClass = "w-full bg-transparent border-0 border-b border-neutral-200 focus:outline-none focus:border-neutral-700 transition-colors duration-200 text-neutral-800 placeholder:text-neutral-400";

function LineInput({ className, large, ...props }) {
  return (
    <input
      className={cn(lineClass, large ? "h-14 text-lg" : "h-11 text-base", className)}
      {...props}
    />
  );
}

function LineTextarea({ className, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(lineClass, "py-3 text-base resize-none leading-relaxed", className)}
      {...props}
    />
  );
}

function PriceInput({ value, onChange, placeholder, disabled }) {
  return (
    <div className="relative">
      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 text-base pointer-events-none">$</span>
      <input
        type="number"
        className={cn(lineClass, "h-11 text-base pl-5 font-mono")}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-5 py-2.5 text-xs font-bold tracking-[0.12em] uppercase border transition-all duration-150",
        active
          ? "border-neutral-800 bg-neutral-800 text-white"
          : "border-neutral-200 text-neutral-500 hover:border-neutral-500 hover:text-neutral-700"
      )}
    >
      {children}
    </button>
  );
}

function TipBox({ color = "green", title, tips, image }) {
  return (
    <div className="border border-neutral-200/80 bg-[#f7f5f2] overflow-hidden rounded-md">
      <div className="flex gap-0">
        {image && (
          <div className="w-48 shrink-0 hidden sm:block">
            <img src={image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="px-5 py-5 space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-amber-500">✦</span>
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-neutral-600">{title}</p>
          </div>
          <ul className="space-y-1.5">
            {tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-neutral-500">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-400 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
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
        "flex flex-col items-center justify-center border border-dashed cursor-pointer transition-all duration-200 py-14 rounded-md",
        dragging ? "border-neutral-500 bg-neutral-50" : "border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50/30"
      )}
    >
      <div className={cn("w-10 h-10 flex items-center justify-center rounded-full border mb-4 transition-colors", dragging ? "border-neutral-600 bg-neutral-100" : "border-neutral-200 bg-white")}>
        <Upload className="w-4 h-4 text-neutral-500" />
      </div>
      <p className="text-sm font-medium text-neutral-600">Drag & drop photos here or <span className="underline">browse</span></p>
      <p className="text-xs text-neutral-400 mt-1.5">JPG, PNG, WEBP up to 25MB</p>
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
  const fromConsignorId = urlParams.get("consignor");
  const fromConsignorName = urlParams.get("consignor_name") ? decodeURIComponent(urlParams.get("consignor_name")) : "";
  const fromConsignorCommission = urlParams.get("commission") || "";

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [itemStatus, setItemStatus] = useState("draft");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  // uploadQueue: array of { id, name, status: 'uploading'|'removing_bg'|'done'|'error' }
  const [uploadQueue, setUploadQueue] = useState([]);
  const [removingBgIndexes, setRemovingBgIndexes] = useState(new Set());
  const [autoBgRemoval, setAutoBgRemoval] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState("minimal");
  const [darkMode, setDarkMode] = useState(false);

  const isLive = LIVE_STATUSES.includes(itemStatus);
  const isUnsold = itemStatus === "unsold";

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
      setTheme(profile?.listing_studio_theme || "minimal");
      setDarkMode(profile?.listing_studio_dark_mode || false);
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
          origin: item.origin || "", location: item.location || profile?.location || "",
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
        setForm(f => ({
          ...f,
          location: profile?.location || "",
          custom_fields: seededFields,
          // Pre-fill consignor if launched from a consignor detail page
          ...(fromConsignorName ? {
            ownership_type: "consignment",
            consignor_name: fromConsignorName,
            consignor_commission_percent: fromConsignorCommission,
          } : {}),
        }));
      }
      setLoading(false);
    };
    loadData();
  }, [editId]);

  const removeBackground = async (imageUrl) => {
    const result = await base44.integrations.Core.GenerateImage({
      prompt: "Remove the background completely from this product photo. Keep the subject perfectly intact with clean edges. Place the subject on a pure white background. Do not modify the item itself in any way.",
      existing_image_urls: [imageUrl],
    });
    return result.url;
  };

  const handleImageUpload = async (files) => {
    const fileArray = Array.from(files);
    setUploadingImages(true);

    // Process all files in parallel
    await Promise.all(fileArray.map(async (file) => {
      const queueId = `${file.name}-${Date.now()}-${Math.random()}`;

      // Add to queue as uploading
      setUploadQueue(q => [...q, { id: queueId, name: file.name, status: "uploading" }]);

      // Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      if (autoBgRemoval) {
        // Update queue status to removing_bg and add placeholder image
        setUploadQueue(q => q.map(item => item.id === queueId ? { ...item, status: "removing_bg" } : item));
        // Add a placeholder URL so the thumbnail slot appears
        setForm(f => ({ ...f, images: [...f.images, file_url] }));

        // Remove background
        const cleanUrl = await removeBackground(file_url);

        // Replace the placeholder with the clean URL
        setForm(f => {
          const idx = f.images.indexOf(file_url);
          if (idx === -1) return { ...f, images: [...f.images, cleanUrl] };
          const updated = [...f.images];
          updated[idx] = cleanUrl;
          return { ...f, images: updated };
        });
      } else {
        setForm(f => ({ ...f, images: [...f.images, file_url] }));
      }

      // Mark done and remove from queue after a short delay
      setUploadQueue(q => q.map(item => item.id === queueId ? { ...item, status: "done" } : item));
      setTimeout(() => setUploadQueue(q => q.filter(item => item.id !== queueId)), 1500);
    }));

    setUploadingImages(false);
  };

  const handleRemoveBgSingle = async (idx) => {
    const url = form.images[idx];
    setRemovingBgIndexes(prev => new Set([...prev, idx]));
    const cleanUrl = await removeBackground(url);
    setForm(f => {
      const updated = [...f.images];
      updated[idx] = cleanUrl;
      return { ...f, images: updated };
    });
    setRemovingBgIndexes(prev => { const n = new Set(prev); n.delete(idx); return n; });
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
    shipping_notes: form.shipping_notes || sellerProfile?.shipping_info || undefined,
    terms_and_conditions: form.terms_and_conditions || sellerProfile?.terms_and_conditions || undefined,
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
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  const deleteItem = async () => {
    setSaving(true);
    await base44.entities.Item.delete(editId);
    setSaving(false);
    navigate(fromConsignorId ? `/seller/consignor/${fromConsignorId}` : "/seller");
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

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    if (sellerProfile?.id) {
      await base44.entities.SellerProfile.update(sellerProfile.id, { listing_studio_theme: newTheme });
    }
  };

  const handleDarkModeChange = async (newDarkMode) => {
    setDarkMode(newDarkMode);
    if (sellerProfile?.id) {
      await base44.entities.SellerProfile.update(sellerProfile.id, { listing_studio_dark_mode: newDarkMode });
    }
  };

  const floorPrice = form.reserve_price && form.below_reserve_percent
    ? (form.reserve_price * (1 - form.below_reserve_percent / 100)).toFixed(0)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="w-5 h-5 border border-neutral-200 border-t-neutral-700 rounded-full animate-spin" />
      </div>
    );
  }

  const statusLabel = isLive ? "Live" : isUnsold ? "Unsold" : isEditMode ? "Draft" : "New";
  const themeColors = THEMES[theme][darkMode ? "dark" : "light"];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: themeColors.bg, color: themeColors.text }}>

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 backdrop-blur-sm border-b" style={{ backgroundColor: `${themeColors.bg}95`, borderColor: darkMode ? "#444" : "#ddd" }}>
        <div className="w-full px-6 md:px-10 h-13 flex items-center gap-4">
          <Link
            to={fromConsignorId ? `/seller/consignor/${fromConsignorId}` : "/seller"}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-800 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs text-neutral-500">
              {fromConsignorName ? fromConsignorName : "Dashboard"}
            </span>
          </Link>

          <span className="text-neutral-300">/</span>
          <span className="text-xs font-semibold text-neutral-700">Listing Studio</span>

          {form.title && (
            <>
              <span className="text-neutral-300">/</span>
              <span className="text-xs text-neutral-400 truncate font-serif italic max-w-[200px]">{form.title}</span>
            </>
          )}

          <span className={cn(
            "text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 border shrink-0",
            isLive ? "border-neutral-700 text-neutral-700" : "border-neutral-300 text-neutral-400"
          )}>
            {statusLabel}
          </span>

          <div className="flex-1" />

          <ThemeCustomizer 
            theme={theme} 
            darkMode={darkMode}
            onThemeChange={handleThemeChange}
            onDarkModeChange={handleDarkModeChange}
          />

          <div className="flex items-center gap-5 shrink-0">
            {editId && (
              <Link to={`/item/${editId}`} target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors">
                <Eye className="w-3.5 h-3.5" /> Preview Listing
              </Link>
            )}
            {isLive && isEditMode && (
              <button onClick={() => setCancelConfirm(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors">
                <XCircle className="w-3.5 h-3.5" /> Cancel Sale
              </button>
            )}
            {!isLive && isEditMode && (
              <button onClick={() => setDeleteConfirm(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
            <button onClick={saveDraft} disabled={saving}
              className={cn("hidden sm:flex items-center gap-1.5 text-xs transition-colors", saved ? "text-emerald-600" : "text-neutral-500 hover:text-neutral-800")}>
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving…" : saved ? "Saved!" : "Save Draft"}
            </button>
            {!isLive && (
              <button
                onClick={isUnsold ? relistNow : publishNow}
                disabled={saving || !form.title || !form.prisometer_start_price}
                className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold tracking-wide px-5 h-9 transition-colors disabled:opacity-30"
              >
                {saving ? "Publishing…" : isUnsold ? "Relist Listing" : "Publish Listing"}
              </button>
            )}
            {isLive && (
              <button onClick={saveDraft} disabled={saving}
                className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold tracking-wide px-5 h-9 transition-colors">
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

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(false)}>
          <div className="bg-white p-10 max-w-sm w-full mx-4 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-base font-bold tracking-wide mb-2">Delete this listing?</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">This will permanently remove the item and cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={deleteItem} disabled={saving}
                className="flex-1 bg-red-600 text-white text-xs font-bold tracking-[0.15em] uppercase py-3.5 hover:bg-red-700 transition-colors">
                {saving ? "Deleting…" : "Yes, Delete"}
              </button>
              <button onClick={() => setDeleteConfirm(false)}
                className="flex-1 border border-neutral-200 text-xs font-bold tracking-[0.15em] uppercase py-3.5 text-neutral-600 hover:border-neutral-500 transition-colors">
                Keep Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setCancelConfirm(false)}>
          <div className="bg-white p-10 max-w-sm w-full mx-4 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-base font-bold tracking-wide mb-2">Cancel this listing?</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">This will end the sale immediately. All watchers and bidders will be notified.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={cancelSale} disabled={saving}
                className="flex-1 bg-neutral-900 text-white text-xs font-bold tracking-[0.15em] uppercase py-3.5 hover:bg-black transition-colors">
                {saving ? "Cancelling…" : "Yes, Cancel"}
              </button>
              <button onClick={() => setCancelConfirm(false)}
                className="flex-1 border border-neutral-200 text-xs font-bold tracking-[0.15em] uppercase py-3.5 text-neutral-600 hover:border-neutral-500 transition-colors">
                Keep Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div className="w-full px-6 md:px-10 py-10 grid grid-cols-1 xl:grid-cols-[160px_1fr_400px] gap-8 pe-[80px]">

        {/* ── Section Navigator ─────────────────────────────────────────── */}
        <div className="hidden xl:block">
          <div className="sticky top-16 flex flex-col">
            {[
              { num: "01", label: "Photos",           id: "section-01" },
              { num: "02", label: "Item Details",     id: "section-02" },
              { num: "03", label: "Description",      id: "section-03" },
              { num: "04", label: "Pricing & Auction",id: "section-04" },
              { num: "05", label: "Inventory &\nLogistics", id: "section-05" },
              { num: "06", label: "Custom Fields",    id: "section-06" },
            ].map(({ num, label, id }) => (
              <button
                key={id}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="group text-left flex items-start gap-3 py-3 border-l-2 border-transparent hover:border-neutral-400 pl-3 transition-all"
              >
                <span className="text-[11px] font-bold text-neutral-300 group-hover:text-neutral-500 tabular-nums mt-0.5 shrink-0">{num}</span>
                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-400 group-hover:text-neutral-700 transition-colors leading-tight whitespace-pre-line">{label}</span>
              </button>
            ))}
            {editId && (
              <Link
                to={`/item/${editId}`}
                target="_blank"
                className="mt-6 flex items-center gap-2 pl-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-400 hover:text-neutral-700 transition-colors group"
              >
                <Eye className="w-3 h-3 shrink-0" />
                Preview
              </Link>
            )}
          </div>
        </div>

        {/* ── LEFT FORM ─────────────────────────────────────────────────── */}
        <div className="space-y-5 min-w-0">

          {/* 01 · Photos */}
          <Section number="01" title="Photos" subtitle="First photo becomes the cover image" themeColors={themeColors} darkMode={darkMode}>
            <DropZone onFiles={handleImageUpload} />

            {/* AI Background Removal Toggle */}
            <div className={cn("flex items-center justify-between px-4 py-3 border rounded-md", autoBgRemoval ? "border-violet-200 bg-violet-50" : "border-neutral-200 bg-neutral-50")}>
              <div className="flex items-center gap-3">
                <Wand2 className={cn("w-4 h-4 shrink-0", autoBgRemoval ? "text-violet-600" : "text-neutral-400")} />
                <div>
                  <p className={cn("text-xs font-bold tracking-[0.12em] uppercase", autoBgRemoval ? "text-violet-700" : "text-neutral-600")}>AI Background Removal</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Automatically remove backgrounds on upload for clean, studio-style images</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoBgRemoval(v => !v)}
                className={cn("relative w-10 h-5.5 rounded-full transition-colors shrink-0 h-6 w-11", autoBgRemoval ? "bg-violet-600" : "bg-neutral-300")}
              >
                <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", autoBgRemoval ? "translate-x-5" : "translate-x-0.5")} />
              </button>
            </div>

            <TipBox title="Tips for Great Photos"
              image="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80"
              tips={[
              "Use natural, diffused light — avoid harsh flash or deep shadows",
              "Shoot on a clean, neutral background (white, grey, or linen)",
              "Include detail shots: signatures, hallmarks, condition",
              "First photo becomes the cover — make it your strongest image",
            ]} />
            {/* Upload Progress Queue */}
            {uploadQueue.length > 0 && (
              <div className="space-y-2">
                {uploadQueue.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 border border-neutral-200 bg-neutral-50 rounded-md">
                    <Loader2 className={cn("w-3.5 h-3.5 shrink-0 animate-spin", item.status === "done" ? "text-emerald-500" : item.status === "removing_bg" ? "text-violet-500" : "text-neutral-400")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-700 truncate">{item.name}</p>
                      <div className="mt-1.5 h-1 bg-neutral-200 rounded-full overflow-hidden">
                        <div className={cn(
                          "h-full rounded-full transition-all duration-500",
                          item.status === "uploading" ? "w-1/3 bg-neutral-400" :
                          item.status === "removing_bg" ? "w-2/3 bg-violet-500 animate-pulse" :
                          "w-full bg-emerald-500"
                        )} />
                      </div>
                    </div>
                    <span className={cn("text-[10px] font-semibold tracking-wide uppercase shrink-0",
                      item.status === "done" ? "text-emerald-500" :
                      item.status === "removing_bg" ? "text-violet-500" :
                      "text-neutral-400"
                    )}>
                      {item.status === "uploading" ? "Uploading" : item.status === "removing_bg" ? "Removing BG…" : "Done"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {form.images.length > 0 && (
              <div>
                <p className="text-xs text-neutral-400 mb-4 tracking-[0.15em] uppercase flex items-center gap-1.5">
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
                                  "relative w-24 h-24 overflow-hidden group",
                                  i === 0 ? "outline outline-2 outline-offset-1 outline-neutral-800" : "outline outline-1 outline-offset-1 outline-neutral-100",
                                  snapshot.isDragging && "shadow-2xl"
                                )}
                              >
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <div {...drag.dragHandleProps} className="absolute top-1 left-1 bg-white/90 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                                  <GripVertical className="w-2.5 h-2.5 text-neutral-600" />
                                </div>
                                {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-neutral-900 text-white text-[8px] text-center py-0.5 tracking-[0.15em] uppercase">Cover</div>}
                                {removingBgIndexes.has(i) && (
                                  <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-1">
                                    <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                                    <span className="text-[8px] text-violet-600 font-bold tracking-wide uppercase">BG</span>
                                  </div>
                                )}
                                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white/90 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-900 hover:text-white text-neutral-600 transition-colors">
                                  <X className="w-2.5 h-2.5" />
                                </button>
                                {!removingBgIndexes.has(i) && (
                                  <button
                                    onClick={e => { e.stopPropagation(); handleRemoveBgSingle(i); }}
                                    title="Remove background"
                                    className="absolute bottom-0 left-0 right-0 bg-violet-600/90 text-white text-[8px] text-center py-0.5 tracking-[0.1em] uppercase opacity-0 group-hover:opacity-100 transition-opacity hover:bg-violet-700 flex items-center justify-center gap-1"
                                    style={i === 0 ? {bottom: "16px"} : {}}
                                  >
                                    <Wand2 className="w-2 h-2" /> BG
                                  </button>
                                )}
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

          {/* 02 · Item Details */}
          <Section number="02" title="Item Details" locked={isLive} themeColors={themeColors} darkMode={darkMode}>
            <Field label="Title" required>
              <LineInput
                large
                className="font-serif text-xl"
                placeholder="e.g. Fernand Léger — Composition Abstraite, 1928"
                value={form.title}
                onChange={e => set("title", e.target.value)}
              />
            </Field>
            <TipBox title="Tips for a Great Title" tips={[
              'Lead with Artist / Maker name if known (e.g. "Henri Matisse — ...")',
              "Include medium or material (Oil on canvas, Bronze, Sterling Silver…)",
              'Add date or period ("circa 1920s", "Art Deco, 1935")',
              "Keep it under 80 characters for best search visibility",
            ]} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <Field label="Category" required>
                <button
                  type="button"
                  onClick={() => setCategoryPickerOpen(true)}
                  className="w-full h-11 border-0 border-b border-neutral-200 bg-transparent text-base text-left flex items-center justify-between gap-2 hover:border-neutral-700 focus:outline-none focus:border-neutral-700 transition-colors duration-200"
                >
                  <span className={form.category ? "text-neutral-800" : "text-neutral-300"}>
                    {form.category
                      ? [MAIN_CATEGORIES.find(c => c.value === form.category)?.label, form.subcategory].filter(Boolean).join(" › ")
                      : "Select category…"}
                  </span>
                  <ChevronLeft className="w-3.5 h-3.5 text-neutral-300 rotate-180 shrink-0" />
                </button>
              </Field>

              <Field label="Condition">
                <select value={form.condition} onChange={e => set("condition", e.target.value)}
                  className="w-full h-11 border-0 border-b border-neutral-200 bg-transparent text-base text-neutral-800 focus:outline-none focus:border-neutral-700 transition-colors duration-200 appearance-none cursor-pointer">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Dimensions">
              <DimensionsInput value={form.dimensions} onChange={v => set("dimensions", v)} />
            </Field>

            <Field label="Marks & Signatures">
              <LineInput placeholder="e.g. Signed lower right in pencil, numbered 14/50" value={form.marks} onChange={e => set("marks", e.target.value)} />
            </Field>

            {form.category && (
              <div className="pt-2 border-t border-neutral-50">
                <CategoryFields form={form} set={set} />
              </div>
            )}
          </Section>

          {/* 03 · Description */}
          <Section number="03" title="Description & Presentation" themeColors={themeColors} darkMode={darkMode}>
            <TipBox title="Tips for a Great Description"
              image="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80"
              tips={[
              "Open with the most important facts: maker, date, medium, subject",
              "Describe what makes this piece significant — rarity, exhibition history, style",
              "Include all physical details: dimensions, materials, technique, origin",
              "Mention provenance if known: previous owners, purchase receipts, auction records",
            ]} />
            <Field label="Short Summary" hint="shown in search results">
              <LineTextarea
                rows={2}
                placeholder="A compelling one-to-two sentence overview that draws buyers in…"
                value={form.short_description}
                onChange={e => set("short_description", e.target.value)}
              />
            </Field>
            <Field label="Full Description">
              <LineTextarea
                rows={6}
                placeholder="Describe the work in detail — style, context, historical significance, visual qualities, exhibition history…"
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <Field label="Condition Report">
                <LineTextarea
                  rows={3}
                  placeholder="Detail any wear, restoration, or damage honestly and precisely…"
                  value={form.condition_notes}
                  onChange={e => set("condition_notes", e.target.value)}
                />
              </Field>
              <Field label="Provenance">
                <LineTextarea
                  rows={3}
                  placeholder="e.g. Private collection, Paris; acquired directly from the artist in 1974…"
                  value={form.provenance}
                  onChange={e => set("provenance", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Terms & Conditions" hint="optional — overrides your default">
              <LineTextarea
                rows={2}
                placeholder={sellerProfile?.terms_and_conditions || "Payment due within 7 days. All sales final…"}
                value={form.terms_and_conditions}
                onChange={e => set("terms_and_conditions", e.target.value)}
              />
              {!form.terms_and_conditions && sellerProfile?.terms_and_conditions && (
                <p className="text-xs text-neutral-400 mt-1">Using your <span className="underline cursor-pointer hover:text-neutral-600" onClick={() => set("terms_and_conditions", sellerProfile.terms_and_conditions)}>default terms</span> — click to customize</p>
              )}
            </Field>
          </Section>

          {/* 04 · Pricing */}
          <Section number="04" title="Pricing & Auction" locked={isLive} badge="Auction Config" themeColors={themeColors} darkMode={darkMode}>
            <TipBox title="Pricing Tips" tips={[
              "Set the PRI$OMETER starting price near the high end of what a serious buyer might pay",
              "The reserve should protect the seller, but still leave room for bidding activity and price movement",
              "Overpricing can reduce early interest — a strong starting price should create urgency, not scare buyers away",
            ]} />
            <div className="grid grid-cols-2 gap-8">
              <Field label="Estimate Low">
                <PriceInput placeholder="8,000" value={form.estimated_low} onChange={e => set("estimated_low", e.target.value)} />
              </Field>
              <Field label="Estimate High">
                <PriceInput placeholder="12,000" value={form.estimated_high} onChange={e => set("estimated_high", e.target.value)} />
              </Field>
              <Field label="Prisometer™ Price" required hint="shown to buyers">
                <PriceInput placeholder="5,000" value={form.prisometer_start_price} onChange={e => set("prisometer_start_price", e.target.value)} />
              </Field>
              <Field label="Hidden Reserve" hint="never disclosed to buyers">
                <PriceInput placeholder="9,000" value={form.reserve_price} onChange={e => set("reserve_price", e.target.value)} />
              </Field>
            </div>

            {floorPrice && (
              <div className="flex items-center gap-2.5 border-l-2 border-neutral-200 pl-4 py-1">
                <Info className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                <span className="text-sm text-neutral-500">
                  Price floor at {form.below_reserve_percent}% below reserve:
                  <strong className="text-neutral-700 ml-1.5">${Number(floorPrice).toLocaleString()}</strong>
                </span>
              </div>
            )}

            <Field label="Below-Reserve Drop Allowance">
              <div className="flex gap-2 pt-1">
                {[10, 15, 20].map(pct => (
                  <Pill key={pct} active={form.below_reserve_percent === pct} onClick={() => set("below_reserve_percent", pct)}>{pct}%</Pill>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2 border-t border-neutral-50">
              <Field label="1stBids™ Preview Duration">
                <div className="flex gap-2 pt-1">
                  {[{ h: 168, label: "7 days" }, { h: 336, label: "14 days" }, { h: 720, label: "30 days" }].map(({ h, label }) => (
                    <Pill key={h} active={form.first_bids_duration_hours === h} onClick={() => set("first_bids_duration_hours", h)}>{label}</Pill>
                  ))}
                </div>
              </Field>
              <Field label="Prisometer™ Live Duration">
                <div className="flex gap-2 pt-1">
                  {[{ h: 168, label: "7 days" }, { h: 336, label: "14 days" }, { h: 504, label: "21 days" }].map(({ h, label }) => (
                    <Pill key={h} active={form.prisometer_duration_hours === h} onClick={() => set("prisometer_duration_hours", h)}>{label}</Pill>
                  ))}
                </div>
              </Field>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-100 pt-5">
              <div>
                <p className="text-sm font-bold tracking-wide text-neutral-700">Make It Mine™</p>
                <p className="text-sm text-neutral-500 mt-1">Buyers can purchase immediately at your asking price.</p>
              </div>
              <span className="text-xs font-bold tracking-[0.15em] uppercase border border-neutral-200 text-neutral-400 px-3 py-1.5">Always On</span>
            </div>
          </Section>

          {/* 05 · Logistics */}
          <Section number="05" title="Inventory & Logistics" themeColors={themeColors} darkMode={darkMode}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <Field label="Inventory No." visibility="private">
                <LineInput placeholder="EV-2024-001" value={form.inventory_number} onChange={e => set("inventory_number", e.target.value)} />
              </Field>
              <Field label="Storage Location" visibility="private">
                <LineInput placeholder="Warehouse B, Shelf 3" value={form.location} onChange={e => set("location", e.target.value)} />
              </Field>
              <Field label="Item Location" hint="shown to buyers" visibility="public">
                <LineInput placeholder="New York, NY" value={form.customer_location} onChange={e => set("customer_location", e.target.value)} />
              </Field>
            </div>
            <Field label="Shipping Notes" visibility="public">
              <LineTextarea
                rows={2}
                placeholder={sellerProfile?.shipping_info || "Packaging, fragility, pickup availability, shipping carriers…"}
                value={form.shipping_notes}
                onChange={e => set("shipping_notes", e.target.value)}
              />
              {!form.shipping_notes && sellerProfile?.shipping_info && (
                <p className="text-xs text-neutral-400 mt-1">Using your <span className="underline cursor-pointer hover:text-neutral-600" onClick={() => set("shipping_notes", sellerProfile.shipping_info)}>default shipping note</span> — click to customize</p>
              )}
            </Field>
            <Field label="Search Keywords" hint="comma-separated" visibility="private">
              <LineTextarea
                rows={2}
                placeholder="oil painting, impressionism, landscape, 19th century…"
                value={form.keywords}
                onChange={e => set("keywords", e.target.value)}
              />
            </Field>

            <div className="border-t border-neutral-100 pt-6">
              <Field label="Ownership Type">
                <div className="flex gap-2 pt-1">
                  {[["owned", "Self-Owned"], ["consignment", "Consignment"]].map(([val, label]) => (
                    <Pill key={val} active={form.ownership_type === val} onClick={() => set("ownership_type", val)}>{label}</Pill>
                  ))}
                </div>
              </Field>
            </div>

            {form.ownership_type === "consignment" && (
              <div className="space-y-8 pt-4 border-t border-neutral-50">
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-neutral-400">Consignor Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Field label="Consignor Name" required>
                    <LineInput placeholder="Full legal name" value={form.consignor_name} onChange={e => set("consignor_name", e.target.value)} />
                  </Field>
                  <Field label="Email">
                    <LineInput type="email" placeholder="email@example.com" value={form.consignor_email} onChange={e => set("consignor_email", e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <LineInput placeholder="+1 (555) 000-0000" value={form.consignor_phone} onChange={e => set("consignor_phone", e.target.value)} />
                  </Field>
                  <Field label="Commission %" hint="seller keeps">
                    <div className="relative">
                      <LineInput type="number" placeholder="30" value={form.consignor_commission_percent} onChange={e => set("consignor_commission_percent", e.target.value)} className="pr-5" />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-300 text-sm pointer-events-none">%</span>
                    </div>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Mailing Address">
                      <LineInput placeholder="Street, City, State, ZIP" value={form.consignor_address} onChange={e => set("consignor_address", e.target.value)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Consignment Notes">
                      <LineTextarea rows={2} placeholder="Payment terms, pickup, special conditions…" value={form.consignor_notes} onChange={e => set("consignor_notes", e.target.value)} />
                    </Field>
                  </div>
                </div>
                {form.consignor_commission_percent && form.prisometer_start_price && (
                  <div className="flex items-center gap-2.5 border-l-2 border-neutral-200 pl-4 py-1">
                    <span className="text-sm text-neutral-500">
                      Estimated consignor payout at start price:
                      <strong className="text-neutral-700 ml-1.5">${(form.prisometer_start_price * (1 - form.consignor_commission_percent / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                      <span className="text-neutral-400 ml-1">({100 - +form.consignor_commission_percent}%)</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* 06 · Custom Fields */}
          <Section number="06" title="Custom Tracking Fields" subtitle="Internal fields saved to your profile template" themeColors={themeColors} darkMode={darkMode}>
            <CustomFieldsEditor fields={form.custom_fields} onChange={handleCustomFieldsChange} />
          </Section>

          {/* ── Bottom Action Bar ── */}
          <div className="border-t border-neutral-200 pt-6 pb-10 flex items-center justify-between gap-4">
            <p className="text-xs text-neutral-400">
              {saved ? "✓ All changes saved" : "Unsaved changes"}
            </p>
            <div className="flex items-center gap-3">
              <button onClick={saveDraft} disabled={saving}
                className={cn("flex items-center gap-1.5 text-xs transition-colors px-4 h-9 border", saved ? "border-emerald-300 text-emerald-600" : "border-neutral-300 text-neutral-600 hover:border-neutral-600 hover:text-neutral-900")}>
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving…" : saved ? "Saved!" : "Save Draft"}
              </button>
              {!isLive && (
                <button
                  onClick={isUnsold ? relistNow : publishNow}
                  disabled={saving || !form.title || !form.prisometer_start_price}
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold tracking-wide px-5 h-9 transition-colors disabled:opacity-30"
                >
                  {saving ? "Publishing…" : isUnsold ? "Relist Listing" : "Publish Listing"}
                </button>
              )}
              {isLive && (
                <button onClick={saveDraft} disabled={saving}
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold tracking-wide px-5 h-9 transition-colors">
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ── RIGHT: AI Assistant ────────────────────────────────────────── */}
        <div className="hidden xl:flex flex-col">
          <div className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide pb-4 border shadow-sm" style={{backgroundColor: darkMode ? '#1a1a1a' : '#ffffff', borderColor: darkMode ? '#333' : '#ddd'}}>
            <AIListingAssistant form={form} onApply={(field, value) => set(field, value)} />
          </div>
        </div>
      </div>
    </div>
  );
}