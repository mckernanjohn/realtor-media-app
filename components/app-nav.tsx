import Link from "next/link";

const links = [
  { href: "/submit", label: "Submit" },
  { href: "/admin", label: "Admin" },
  { href: "/media", label: "Public media" },
] as const;

export function AppNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[color-mix(in_oklab,var(--card)_88%,transparent)] shadow-[0_1px_0_rgba(28,25,23,0.04)] backdrop-blur-md dark:border-stone-800/80 dark:bg-[color-mix(in_oklab,var(--card)_75%,transparent)] dark:shadow-[0_1px_0_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="min-w-0">
          <Link
            href="/"
            className="block text-[15px] font-semibold tracking-tight text-stone-900 dark:text-stone-50"
          >
            Grey Collective — Realtor Media
          </Link>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500 dark:text-stone-500">
            Media intake · Review · Publishing control
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center gap-1 rounded-full border border-stone-200/80 bg-white/60 p-1 dark:border-stone-700/80 dark:bg-stone-900/50"
          aria-label="Primary"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-900 hover:text-white dark:text-stone-300 dark:hover:bg-stone-100 dark:hover:text-stone-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
