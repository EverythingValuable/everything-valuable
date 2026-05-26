import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Paperclip, X, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProvenanceDocUpload({ docs = [], onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    setUploading(true);
    const uploaded = await Promise.all(
      Array.from(files).map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return { name: file.name, url: file_url };
      })
    );
    onChange([...docs, ...uploaded]);
    setUploading(false);
  };

  const remove = (i) => onChange(docs.filter((_, idx) => idx !== i));

  return (
    <div className="mt-3 space-y-2">
      {docs.length > 0 && (
        <div className="space-y-1.5">
          {docs.map((doc, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-sm">
              <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-600 hover:text-neutral-900 underline truncate flex-1"
              >
                {doc.name}
              </a>
              <button type="button" onClick={() => remove(i)} className="text-neutral-300 hover:text-neutral-600 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className={cn(
        "inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-neutral-400 hover:text-neutral-700 cursor-pointer transition-colors",
        uploading && "opacity-50 pointer-events-none"
      )}>
        {uploading
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
          : <><Paperclip className="w-3.5 h-3.5" /> Attach provenance document (JPG, PDF)</>
        }
        <input
          type="file"
          accept=".jpg,.jpeg,.pdf"
          multiple
          className="sr-only"
          onChange={e => handleFiles(e.target.files)}
        />
      </label>
    </div>
  );
}