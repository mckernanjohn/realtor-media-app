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
import {
  INTENDED_USE_OPTIONS,
  MEDIA_TYPE_OPTIONS,
  PROJECT_OPTIONS,
  PROPERTY_AREA_OPTIONS,
  PROJECT_PHASE_OPTIONS,
  SUBMISSION_CATEGORY_OPTIONS,
  SUBMITTER_TYPE_OPTIONS,
} from "@/lib/media/types";

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
  "w-full rounded-xl border border-stone-200/90 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-[0_1px_0_rgba(28,25,23,0.03)] outline-none ring-stone-400/25 placeholder:text-stone-400 focus:border-stone-300 focus:ring-2 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:shadow-none dark:ring-stone-600/35";

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400";

const sectionShell =
  "space-y-6 rounded-2xl border border-stone-200/90 bg-[var(--card)] p-7 shadow-[var(--shadow-card)] dark:border-stone-800";

const sectionTitle = "text-[13px] font-semibold tracking-tight text-stone-900 dark:text-stone-50";

const sectionHint = "mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400";

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
      className="space-y-8"
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
      <section className={sectionShell}>
        <header className="border-b border-stone-200/70 pb-5 dark:border-stone-800">
          <h2 className={sectionTitle}>Contact & team</h2>
          <p className={sectionHint}>
            Mock intake — nothing is persisted beyond this server session. Later phases add secure storage and
            identity.
          </p>
        </header>
        <div className="grid gap-5 sm:grid-cols-2">
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
            <span className={labelClass}>Company / team</span>
            <input name="companyTeam" required className={fieldClass} placeholder="Brokerage, GC, studio, or internal team" />
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className={labelClass}>Submitter type</span>
            <select name="submitterType" required className={fieldClass}>
              {SUBMITTER_TYPE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className={sectionShell}>
        <header className="border-b border-stone-200/70 pb-5 dark:border-stone-800">
          <h2 className={sectionTitle}>Submission context</h2>
          <p className={sectionHint}>
            Brokers can submit listing or marketing media. Superintendents and project staff can submit construction
            progress — it defaults to internal review. Nothing becomes public until an admin publishes to the Public
            Media Gallery.
          </p>
        </header>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2 sm:col-span-2">
            <span className={labelClass}>Submission category</span>
            <select name="submissionCategory" required className={fieldClass}>
              {SUBMISSION_CATEGORY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className={labelClass}>Project phase</span>
            <select name="projectPhase" required className={fieldClass}>
              {PROJECT_PHASE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className={labelClass}>Property area</span>
            <select name="propertyArea" required className={fieldClass}>
              {PROPERTY_AREA_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className={labelClass}>Progress date</span>
            <input
              name="progressDate"
              className={fieldClass}
              placeholder="e.g. 2026-05-01 or as-of label"
            />
          </label>
        </div>
      </section>

      <section className={sectionShell}>
        <header className="border-b border-stone-200/70 pb-5 dark:border-stone-800">
          <h2 className={sectionTitle}>Property</h2>
          <p className={sectionHint}>
            Listing, development, or jobsite context — Arizona luxury residential focus.
          </p>
        </header>
        <div className="grid gap-5 sm:grid-cols-2">
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

      <section className={sectionShell}>
        <header className="border-b border-stone-200/70 pb-5 dark:border-stone-800">
          <h2 className={sectionTitle}>Media details</h2>
          <p className={sectionHint}>
            One media row per submission in this mock; the structure supports more assets later without rework.
          </p>
        </header>
        <div className="grid gap-5">
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

      <section className="space-y-6 rounded-2xl border border-dashed border-stone-300/80 bg-stone-900/[0.02] p-7 dark:border-stone-600 dark:bg-stone-950/40">
        <header className="border-b border-stone-200/60 pb-5 dark:border-stone-800">
          <h2 className={sectionTitle}>Mock file selection</h2>
          <p className={sectionHint}>
            JPG, JPEG, PNG, WEBP, MP4, MOV — client-side checks only. No bytes are uploaded; a future managed
            storage layer will replace this step.
          </p>
        </header>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 space-y-4">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
              className="block w-full max-w-lg text-sm text-stone-700 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-stone-900 file:px-5 file:py-2.5 file:text-xs file:font-semibold file:text-stone-50 file:shadow-sm hover:file:bg-stone-800 dark:text-stone-300 dark:file:bg-stone-100 dark:file:text-stone-900 dark:hover:file:bg-white"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
            {file && validation ? (
              <ul className="space-y-1.5 rounded-xl border border-stone-200/90 bg-[var(--card)] p-4 text-xs leading-relaxed text-stone-700 shadow-sm dark:border-stone-800 dark:text-stone-300">
                {validation.messages.map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-500 dark:text-stone-500">
                Choose a file to see filename, type, size messaging, and validation notes.
              </p>
            )}
          </div>
          <div className="w-full shrink-0 lg:w-56">
            <div
              className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-stone-200/90 bg-[linear-gradient(145deg,#e7e5e4_0%,#fafaf9_42%,#d6d3d1_100%)] text-2xl font-semibold tracking-tight text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),var(--shadow-card)] dark:border-stone-700 dark:bg-[linear-gradient(145deg,#292524_0%,#1c1917_45%,#44403c_100%)] dark:text-stone-200"
              aria-hidden
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.14] dark:opacity-[0.12]"
                style={{
                  backgroundImage: `repeating-linear-gradient(-12deg, transparent, transparent 5px, rgba(28,25,23,0.08) 5px, rgba(28,25,23,0.08) 6px)`,
                }}
              />
              <span className="relative">{file && validation?.ok ? previewLabel : "—"}</span>
            </div>
            <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Mock media preview
            </p>
            <p className="mt-1 text-center text-[10px] leading-snug text-stone-400 dark:text-stone-500">
              Placeholder · future managed asset
            </p>
          </div>
        </div>
        <input type="hidden" name="mockFileDisplayName" value={file?.name ?? ""} />
        <input type="hidden" name="mockFileMimeType" value={file?.type ?? ""} />
        <input type="hidden" name="mockFileSizeLabel" value={file ? formatBytes(file.size) : ""} />
        <input type="hidden" name="mockFilePreviewLabel" value={previewLabel} />
      </section>

      <label className="flex cursor-pointer gap-4 rounded-2xl border border-stone-200/90 bg-[var(--card)] p-5 text-sm leading-snug text-stone-800 shadow-[var(--shadow-card)] dark:border-stone-800 dark:text-stone-200">
        <input
          type="checkbox"
          name="permissionConfirm"
          className="mt-0.5 size-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400 dark:border-stone-600"
        />
        <span>
          I confirm I have permission to submit this media for Grey Collective Development review.
        </span>
      </label>

      {serverError ? (
        <p className="rounded-2xl border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-100">
          {serverError}
        </p>
      ) : null}

      {done ? (
        <p className="rounded-2xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900/45 dark:bg-emerald-950/35 dark:text-emerald-50">
          Submission recorded. Status starts as <span className="font-semibold">Submitted</span> — continue in
          Admin.
        </p>
      ) : null}

      <div className="flex flex-col gap-5 border-t border-stone-200/80 pt-8 dark:border-stone-800 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="submit"
          disabled={pending || !file || !validation?.ok}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-stone-900 px-8 py-3 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition-[background-color,transform,box-shadow] hover:bg-stone-800 hover:shadow-[var(--shadow-card-hover)] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        >
          {pending ? "Submitting…" : "Submit for Grey Collective review"}
        </button>
        <p className="max-w-md text-xs leading-relaxed text-stone-500 dark:text-stone-500">
          Staff set publishing destination; the public gallery only shows work explicitly routed to the Public Media
          Gallery after publish.
        </p>
      </div>
    </form>
  );
}
