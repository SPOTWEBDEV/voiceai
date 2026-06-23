"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload, FileText, CheckCircle, AlertCircle,
  ClipboardPaste, File, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  groupId: string;
  groupName: string;
  onSuccess: () => void;
}

type Tab = "file" | "paste";

export default function ContactImporter({ groupId, groupName, onSuccess }: Props) {
  const [tab, setTab] = useState<Tab>("file");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ imported: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [open, setOpen] = useState(false);

  const reset = () => { setResult(null); setError(null); setPasteText(""); };

  // ── File upload handler ─────────────────────────────────────────────────────
  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`/api/contact-groups/${groupId}/upload`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResult(data);
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }, [groupId, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    multiple: false,
  });

  // ── Paste / textarea handler ────────────────────────────────────────────────
  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) { setError("Please enter some contact data."); return; }
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/contact-groups/${groupId}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data);
      setPasteText("");
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <Upload size={16} className="text-primary" />
          Add contacts to &ldquo;{groupName}&rdquo;
        </span>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>

      {open && (
        <div className="p-4 space-y-4 border-t bg-card">
          {/* Success state */}
          {result && (
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">
                  {result.imported} contact{result.imported !== 1 ? "s" : ""} imported
                  {result.total !== result.imported ? ` (${result.total - result.imported} skipped — no phone)` : ""}
                </span>
              </div>
              <button onClick={reset} className="text-xs text-green-600 dark:text-green-400 underline hover:no-underline">
                Import more
              </button>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                <button onClick={reset} className="text-xs text-red-600 dark:text-red-400 underline mt-1">Try again</button>
              </div>
            </div>
          )}

          {!result && (
            <>
              {/* Tab switcher */}
              <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
                <button
                  type="button"
                  onClick={() => { setTab("file"); reset(); }}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors",
                    tab === "file" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <File size={13} />Upload File
                </button>
                <button
                  type="button"
                  onClick={() => { setTab("paste"); reset(); }}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors",
                    tab === "paste" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ClipboardPaste size={13} />Paste Text
                </button>
              </div>

              {/* File drop zone */}
              {tab === "file" && (
                <div>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20"
                    )}
                  >
                    <input {...getInputProps()} />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileText size={36} className="animate-pulse text-primary" />
                        <p className="text-sm font-medium">Parsing file…</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload size={32} className={isDragActive ? "text-primary" : ""} />
                        <p className="text-sm font-medium">
                          {isDragActive ? "Drop it here!" : "Drop file or click to browse"}
                        </p>
                        <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                          {["CSV", "Excel (.xlsx)", "PDF", "TXT"].map((fmt) => (
                            <span key={fmt} className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">{fmt}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Format hint */}
                  <div className="mt-3 bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">Expected columns (CSV/Excel):</p>
                    <p><code className="bg-muted px-1 rounded">phone</code> — required · <code className="bg-muted px-1 rounded">name</code>, <code className="bg-muted px-1 rounded">email</code>, <code className="bg-muted px-1 rounded">company</code>, <code className="bg-muted px-1 rounded">notes</code> — optional</p>
                    <p className="pt-1 font-medium text-foreground">For PDF / TXT:</p>
                    <p>One contact per line. Example: <code className="bg-muted px-1 rounded">John Smith +2348012345678 john@co.com</code></p>
                  </div>
                </div>
              )}

              {/* Paste textarea */}
              {tab === "paste" && (
                <div className="space-y-3">
                  <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">Accepted formats:</p>
                    <p>• CSV with headers: <code className="bg-muted px-1 rounded">name,phone,email</code></p>
                    <p>• One contact per line: <code className="bg-muted px-1 rounded">John Smith +2348012345678</code></p>
                    <p>• Just phone numbers, one per line</p>
                  </div>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={8}
                    placeholder={`Paste contacts here. Examples:\n\nname,phone,email\nJohn Smith,+2348012345678,john@co.com\nJane Doe,+2348087654321,\n\nOR plain text:\nJohn Smith +2348012345678\nJane Doe 08087654321 jane@co.com`}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handlePasteSubmit}
                    disabled={uploading || !pasteText.trim()}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Importing…
                      </>
                    ) : (
                      <>
                        <ClipboardPaste size={15} />
                        Import Contacts
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
