import Link from "next/link";

const links = [
  { href: "/submit", label: "Submit" },
  { href: "/admin", label: "Admin" },
  { href: "/media", label: "Public media" },
] as const;

export function AppNav() {
  return (
    <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-50"
        >
          Grey Collective — Realtor Media
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
