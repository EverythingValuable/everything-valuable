import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Upload, Download, FileText, Image, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── CSV Template ────────────────────────────────────────────────────────────
const CSV_HEADERS = [
  "lot_number","title","category","condition","description","provenance",
  "materials","dimensions","period","origin","location","condition_notes",
  "shipping_notes","prisometer_start_price","reserve_price",
  "below_reserve_percent","prisometer_duration_hours","first_bids_duration_hours",
  "estimated_low","estimated_high","status"
];

const CSV_EXAMPLE_ROWS = [];

function downloadTemplate() {
  // Headers only — no example rows so accidental uploads don't create dummy items
  const csv = CSV_HEADERS.map(h => `"${h}"`).join(",") + "\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ev_bulk_items_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── CSV Parser (RFC-4180 compliant) ─────────────────────────────────────────
function parseCSVTokens(text) {
  // Tokenize the entire file character-by-character, respecting quoted fields
  // that may contain commas, newlines, and escaped quotes ("")
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        // Escaped quote inside quoted field
        field += '"';
        i += 2;
        continue;
      } else if (ch === '"') {
        // End of quoted field
        inQuotes = false;
        i++;
        continue;
      } else {
        field += ch;
        i++;
        continue;
      }
    }

    // Not in quotes
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ',') {
      row.push(field.trim());
      field = "";
      i++;
      continue;
    }
    if (ch === '\r' && next === '\n') {
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = "";
      i += 2;
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }

  // Push last field/row
  if (field || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }

  return rows;
}

function parseCSV(text) {
  const rows = parseCSVTokens(text.trim());
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.replace(/"/g, "").trim());
  return rows.slice(1)
    .map(vals => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
      return obj;
    })
    .filter(r => r.title || r.lot_number);
}

// ─── DropZone ─────────────────────────────────────────────────────────────────
function DropZone({ onFiles, accept, label, sublabel, icon: IconComponent }) {
  const [dragging, setDragging] = useState(false);
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    onFiles(e.dataTransfer.files);
  }, [onFiles]);

  return (
    <label
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all py-10 px-6 text-center",
        dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-secondary/20"
      )}>
      <IconComponent className="w-8 h-8 text-muted-foreground mb-3" />
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
      <input type="file" accept={accept} multiple className="sr-only" onChange={e => onFiles(e.target.files)} />
    </label>
  );
}

// ─── Result List ─────────────────────────────────────────────────────────────
function ResultBox({ result }) {
  if (!result) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-sm">
      <div className="flex gap-4 flex-wrap">
        {result.created !== undefined && (
          <span className="flex items-center gap-1.5 text-green-700"><CheckCircle2 className="w-4 h-4" /> {result.created} created</span>
        )}
        {result.updated !== undefined && (
          <span className="flex items-center gap-1.5 text-primary"><CheckCircle2 className="w-4 h-4" /> {result.updated} updated</span>
        )}
        {result.skipped !== undefined && result.skipped > 0 && (
          <span className="flex items-center gap-1.5 text-amber-600"><AlertCircle className="w-4 h-4" /> {result.skipped} skipped</span>
        )}
      </div>
      {result.errors?.length > 0 && (
        <div className="mt-2 space-y-1">
          {result.errors.map((e, i) => (
            <p key={i} className="text-xs text-destructive flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span><strong>{e.lot || e.row}</strong>: {e.error}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BulkUpload() {
  const navigate = useNavigate();

  // CSV state
  const [csvRows, setCsvRows] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResult, setCsvResult] = useState(null);

  // Photo state
  const [photoFiles, setPhotoFiles] = useState([]); // { filename, file, preview }
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoResult, setPhotoResult] = useState(null);

  // ── CSV handlers ────────────────────────────────────────────────────────────
  const handleCSVFile = (files) => {
    const file = files[0];
    if (!file) return;
    setCsvFileName(file.name);
    setCsvResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target.result);
      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  const uploadCSV = async () => {
    if (!csvRows.length) return;
    setCsvLoading(true);
    setCsvResult(null);
    const res = await base44.functions.invoke("bulkUploadItems", { rows: csvRows });
    setCsvResult(res.data);
    setCsvLoading(false);
  };

  const [photoProgress, setPhotoProgress] = useState({ done: 0, total: 0 });

  // ── Photo handlers ──────────────────────────────────────────────────────────
  const handlePhotoFiles = (files) => {
    setPhotoResult(null);
    const newFiles = Array.from(files).map(f => ({
      filename: f.name,
      file: f,
      preview: URL.createObjectURL(f),
      lot: f.name.split("_")[0],
    }));
    setPhotoFiles(prev => [...prev, ...newFiles]);
  };

  const removePhoto = (idx) => {
    setPhotoFiles(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const uploadPhotos = async () => {
    if (!photoFiles.length) return;
    setPhotoLoading(true);
    setPhotoResult(null);
    setPhotoProgress({ done: 0, total: photoFiles.length });

    // Upload each file sequentially so progress is meaningful
    const uploaded = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const pf = photoFiles[i];
      const { file_url } = await base44.integrations.Core.UploadFile({ file: pf.file });
      uploaded.push({ filename: pf.filename, file_url });
      setPhotoProgress({ done: i + 1, total: photoFiles.length });
    }

    const res = await base44.functions.invoke("bulkUploadPhotos", { photos: uploaded });
    setPhotoResult(res.data);
    setPhotoFiles([]);
    setPhotoLoading(false);
    setPhotoProgress({ done: 0, total: 0 });
  };

  // Group photos by lot for display
  const photosByLot = photoFiles.reduce((acc, pf) => {
    if (!acc[pf.lot]) acc[pf.lot] = [];
    acc[pf.lot].push(pf);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur px-6 py-3 flex items-center gap-4">
        <button onClick={() => navigate("/seller")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="font-serif text-sm font-semibold">Bulk Upload</p>
          <p className="text-[11px] text-muted-foreground">Import items via CSV and attach photos by lot number</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">

        {/* ── SECTION 1: CSV ─────────────────────────────────────────────── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Step 1 — Item CSV
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a CSV to create or update items. Matching is done by <strong>lot_number</strong> (or <strong>id</strong> if provided).
                Existing items are updated; new lot numbers are created.
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
            <Download className="w-4 h-4" /> Download CSV Template
          </Button>

          {/* Column reference */}
          <div className="rounded-xl border border-border bg-secondary/30 p-4 text-xs space-y-2">
            <p className="font-semibold text-muted-foreground uppercase tracking-wider">CSV Columns</p>
            <div className="flex flex-wrap gap-1.5">
              {CSV_HEADERS.map(h => (
                <Badge key={h} variant="outline" className="font-mono text-[10px]">{h}</Badge>
              ))}
            </div>
            <p className="text-muted-foreground mt-1">
              <strong>lot_number</strong> is the key for photo linking. <strong>id</strong> overrides lot_number for matching.
              Leave <strong>status</strong> as <code>draft</code> unless you want to publish immediately.
            </p>
          </div>

          {/* Upload zone */}
          {!csvFileName ? (
            <DropZone
              onFiles={handleCSVFile}
              accept=".csv"
              label="Drop your CSV file here or click to browse"
              sublabel="CSV files only"
              icon={FileText}
            />
          ) : (
            <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{csvFileName}</p>
                  <p className="text-xs text-muted-foreground">{csvRows.length} item row{csvRows.length !== 1 ? "s" : ""} parsed</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setCsvFileName(""); setCsvRows([]); setCsvResult(null); }}>
                  <X className="w-4 h-4" />
                </Button>
                <Button onClick={uploadCSV} disabled={csvLoading || !csvRows.length} className="gap-2">
                  {csvLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {csvLoading ? "Uploading…" : "Import Items"}
                </Button>
              </div>
            </div>
          )}

          <ResultBox result={csvResult} />
        </section>

        <div className="border-t border-border" />

        {/* ── SECTION 2: PHOTOS ──────────────────────────────────────────── */}
        <section className="space-y-5">
          <div>
            <h2 className="font-serif text-2xl font-semibold flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" /> Step 2 — Bulk Photo Upload
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Name your photos using the lot number: <strong>1_1.jpg, 1_2.jpg, 2_01.jpg</strong>, etc.
              Photos are <strong>appended</strong> to existing images — never overwritten.
              Each upload session is independent, so you can safely upload new batches without affecting previous ones.
            </p>
          </div>

          {/* Naming convention guide */}
          <div className="rounded-xl border border-border bg-secondary/30 p-4 text-xs space-y-2">
            <p className="font-semibold text-muted-foreground uppercase tracking-wider">Naming Convention</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-medium text-foreground mb-1">Accepted formats</p>
                <code className="block text-muted-foreground">1_1.jpg &nbsp;→ Lot 1, photo 1</code>
                <code className="block text-muted-foreground">1_01.jpg → Lot 1, photo 1</code>
                <code className="block text-muted-foreground">2_3.png &nbsp;→ Lot 2, photo 3</code>
                <code className="block text-muted-foreground">10_02.jpg → Lot 10, photo 2</code>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">How it works</p>
                <p className="text-muted-foreground leading-relaxed">
                  The number before the first <code>_</code> is your lot number.
                  Lot numbers reset each upload session — you can reuse lot 1, 2, 3…
                  on every new batch without risk of mixing up items.
                </p>
              </div>
            </div>
          </div>

          <DropZone
            onFiles={handlePhotoFiles}
            accept="image/*"
            label="Drop photos here or click to browse"
            sublabel="JPEG, PNG, WEBP — name files as 1_1.jpg, 2_01.jpg, etc."
            icon={Image}
          />

          {/* Preview by lot */}
          {Object.keys(photosByLot).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{photoFiles.length} photo{photoFiles.length !== 1 ? "s" : ""} queued across {Object.keys(photosByLot).length} lot{Object.keys(photosByLot).length !== 1 ? "s" : ""}</p>
                <Button onClick={uploadPhotos} disabled={photoLoading} className="gap-2">
                  {photoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {photoLoading ? "Uploading…" : "Upload Photos"}
                </Button>
              </div>
              {photoLoading && photoProgress.total > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading photo {photoProgress.done} of {photoProgress.total}…</span>
                    <span>{Math.round((photoProgress.done / photoProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${(photoProgress.done / photoProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {Object.entries(photosByLot).map(([lot, photos]) => (
                <div key={lot} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">Lot {lot}</Badge>
                    <span className="text-xs text-muted-foreground">{photos.length} photo{photos.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {photos.map((pf, i) => {
                      const globalIdx = photoFiles.findIndex(p => p === pf);
                      return (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                          <img src={pf.preview} alt={pf.filename} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removePhoto(globalIdx)}
                            className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                          <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] px-1 py-0.5 truncate">{pf.filename}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <ResultBox result={photoResult} />
        </section>
      </div>
    </div>
  );
}