"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ACCEPTED_MIME, MAX_BYTES, type DocumentType } from "@/lib/documents";

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name).normalize("NFKD").replace(/[^\w-]+/g, "-").slice(0, 60);
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return ext ? `${base}.${ext}` : base;
}

export function DocumentUploader({ userId, type, label }: { userId: string; type: DocumentType; label: string }) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const mime = file.type || (file.name.toLowerCase().endsWith(".heic") ? "image/heic" : "");
      if (!ACCEPTED_MIME.includes(mime)) {
        setError(`${file.name}: only PDF, JPG, PNG, HEIC or WEBP files.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than 10 MB.`);
        continue;
      }
      const path = `${userId}/${type}/${crypto.randomUUID()}-${safeName(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from("student-documents")
        .upload(path, file, { contentType: mime, upsert: false });
      if (upErr) {
        setError(`Upload failed for ${file.name}. Please try again.`);
        continue;
      }
      const { error: dbErr } = await supabase.from("documents").insert({
        user_id: userId,
        document_type: type,
        storage_path: path,
        file_name: file.name.slice(0, 200),
        mime_type: mime,
        size_bytes: file.size,
      });
      if (dbErr) {
        await supabase.storage.from("student-documents").remove([path]);
        setError(`Could not save ${file.name}. Please try again.`);
      }
    }

    setBusy(false);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.heic,.webp,application/pdf,image/*"
        className="sr-only"
        id={`upload-${type}`}
        onChange={(e) => upload(e.target.files)}
        disabled={busy}
      />
      <label
        htmlFor={`upload-${type}`}
        aria-label={`Upload ${label}`}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium hover:border-ink/40 ${
          busy ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M7 10V2M3.5 5.5L7 2l3.5 3.5M2 12h10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {busy ? "Uploading…" : "Upload"}
      </label>
      {error && <p className="mt-2 text-sm text-accent">{error}</p>}
    </div>
  );
}
