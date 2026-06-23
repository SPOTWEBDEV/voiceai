"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { onSuccess: () => void; }

export default function ContactUpload({ onSuccess }: Props) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/contacts/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResult(data.imported);
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }, [onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      <input {...getInputProps()} />

      {result !== null ? (
        <div className="flex flex-col items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle size={40} />
          <p className="font-semibold text-lg">{result} contacts imported!</p>
          <p className="text-sm text-muted-foreground">Your contact list has been updated below.</p>
          <button
            onClick={(e) => { e.stopPropagation(); setResult(null); }}
            className="text-xs text-muted-foreground underline mt-1 hover:text-foreground"
          >
            Upload another file
          </button>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertCircle size={40} />
          <p className="font-semibold">{error}</p>
          <button
            onClick={(e) => { e.stopPropagation(); setError(null); }}
            className="text-xs text-muted-foreground underline mt-1 hover:text-foreground"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          {uploading
            ? <FileText size={40} className="animate-pulse text-primary" />
            : <Upload size={40} />
          }
          <div>
            <p className="font-semibold text-foreground">
              {uploading ? "Uploading and parsing…" : "Drop your CSV or XLSX file here"}
            </p>
            <p className="text-sm mt-1">or click to browse</p>
          </div>
          {!uploading && (
            <div className="mt-2 text-xs bg-muted rounded-lg px-4 py-2 inline-block">
              Required column: <strong>phone</strong> · Optional: name, email, company, notes
            </div>
          )}
        </div>
      )}
    </div>
  );
}
