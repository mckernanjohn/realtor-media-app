"use client";

/**
 * Client intake UI — replace mock FormData + hidden fields with:
 * - Supabase Storage: signed upload, progress, resumable multipart
 * - Supabase DB: insert submission + media_items in one transaction
 * - Notifications: intake confirmation email / Slack
 */

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { submitIntakeAction } from "@/app/actions/media";
import { validateMockFileSelection, type MockValidationResult } from "@/lib/media/mock-validation";
import { INTENDED_USE_OPTIONS, MEDIA_TYPE_OPTIONS, PROJECT_OPTIONS } from "@/lib/media/types";

function initialsPreview(name: string) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]+/g, " ").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : parts[0]?.[1] ?? "";
  return (a + b).toUpperCase().slice(0, 4) || "GC";
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

const fieldClass =
  "w-full rounded-lg border border-stone-200/90 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-sm outline-none ring-stone-400/30 placeholder:text-stone-400 focus:ring-2 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:ring-stone-600/40";

const labelClass = "text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400";

export function SubmitMediaForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<MockValidationResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const previewLabel = useMemo(() => (file ? initialsPreview(file.name) : ""), [file]);

  function onPick(next: File | null) {
    setServerError(null);
    setDone(false);
    setFile(next);
    if (!next) {
      setValidation(null);
      return;
    }
    setValidation(validateMockFileSelection(next));
  }

  return (
    <form
      className="space-y-10"
      action={(formData) => {
        setServerError(null);
        setDone(false);
        startTransition(async () => {
          const res = await submitIntakeAction(formData);
          if (!res.ok) {
            setServerError(res.error);
            return;
          }
          setDone(true);
          setFile(null);
          setValidation(null);
          router.refresh();
        });
      }}
    >
      <section className="space-y-5 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <header>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Contact & brokerage</h2>
          <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
            Mock intake — no data leaves this environment. Later: Supabase + auth + CRM sync.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className={labelClass}>Submitter name</span>
            <input name="submitterName" required className={fieldClass} placeholder="Full name" />
          </label>
          <label className="block space-y-2">
            <span className={labelClass}>Submitter email</span>
            <input
              name="submitterEmail"
              type="email"
              required
              className={fieldClass}
              placeholder="name@company.com"
            />
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className={labelClass}>Brokerage / company</span>
            <input name="brokerageCompany" required className={fieldClass} placeholder="Brokerage name" />
          </label>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <header>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Property</h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 sm:col-span-2">
            <span className={labelClass}>Property name</span>
            <input name="propertyName" required className={fieldClass} placeholder="Marketing name" />
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className={labelClass}>Property address</span>
            <input name="propertyAddress" required className={fieldClass} placeholder="Street, unit, city" />
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className={labelClass}>Location</span>
            <input name="location" required className={fieldClass} placeholder="Region, market, or metro" />
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className={labelClass}>Project assignment</span>
            <select name="projectAssignment" required className={fieldClass}>
              {PROJECT_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className={labelClass}>Intended use</span>
            <select name="intendedUse" required className={fieldClass}>
              {INTENDED_USE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950">
        <header>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Media details</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Phase 1 supports one media row per submission; the array shape is forward-compatible.
          </p>
        </header>
        <div className="grid gap-4">
          <label className="block space-y-2">
            <span className={labelClass}>Media title</span>
            <input name="mediaTitle" required className={fieldClass} />
          </label>
          <label className="block space-y-2">
            <span className={labelClass}>Media description</span>
            <textarea name="mediaDescription" required rows={3} className={fieldClass} />
          </label>
          <label className="block space-y-2">
            <span className={labelClass}>Suggested caption</span>
            <textarea name="suggestedCaption" rows={2} className={fieldClass} />
          </label>
          <label className="block space-y-2">
            <span className={labelClass}>Media type</span>
            <select name="mediaType" required className={fieldClass}>
              {MEDIA_TYPE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-dashed border-stone-300/90 bg-stone-50/50 p-6 dark:border-stone-700 dark:bg-stone-900/30">
        <header>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Mock file selection</h2>
          <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
            JPG, JPEG, PNG, WEBP, MP4, MOV — client-side checks only.{" "}
            <span className="font-medium text-stone-800 dark:text-stone-200">
              Supabase Storage will replace this layer.
            </span>
          </p>
        </header>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 space-y-3">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
              className="block w-full max-w-lg text-sm text-stone-700 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-stone-50 hover:file:bg-stone-800 dark:text-stone-300 dark:file:bg-stone-100 dark:file:text-stone-900"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
            {file && validation ? (
              <ul className="space-y-1.5 rounded-xl border border-stone-200 bg-white p-4 text-xs leading-relaxed text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300">
                {validation.messages.map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-500 dark:text-stone-500">
                Pick a file to see filename, MIME label, size messaging, and unsupported-type / oversized
                copy.
              </p>
            )}
          </div>
          <div className="w-full shrink-0 lg:w-52">
            <div
              className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-stone-200 bg-gradient-to-br from-stone-200 via-stone-50 to-amber-100/40 text-2xl font-semibold tracking-tight text-stone-700 shadow-inner dark:border-stone-700 dark:from-stone-800 dark:via-stone-900 dark:to-stone-950 dark:text-stone-200"
              aria-hidden
            >
              {file && validation?.ok ? previewLabel : "—"}
            </div>
            <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-wide text-stone-500">
              Simulated preview
            </p>
          </div>
        </div>
        <input type="hidden" name="mockFileDisplayName" value={file?.name ?? ""} />
        <input type="hidden" name="mockFileMimeType" value={file?.type ?? ""} />
        <input type="hidden" name="mockFileSizeLabel" value={file ? formatBytes(file.size) : ""} />
        <input type="hidden" name="mockFilePreviewLabel" value={previewLabel} />
      </section>

      <label className="flex cursor-pointer gap-3 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-800 shadow-sm dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200">
        <input type="checkbox" name="permissionConfirm" className="mt-0.5 size-4 rounded border-stone-300" />
        <span>
          I confirm I have permission to submit this media for Grey Collective Development review.
        </span>
      </label>

      {serverError ? (
        <p className="rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100">
          {serverError}
        </p>
      ) : null}

      {done ? (
        <p className="rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-50">
          Submission recorded. Status starts as <span className="font-semibold">Submitted</span> — continue
          in Admin.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || !file || !validation?.ok}
          className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        >
          {pending ? "Submitting…" : "Submit for Grey Collective review"}
        </button>
        <p className="max-w-md text-xs leading-relaxed text-stone-500 dark:text-stone-500">
          Publishing is admin-only after checklist review and explicit publish — never automatic from
          approval.
        </p>
      </div>
    </form>
  );
}
