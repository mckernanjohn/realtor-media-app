type PageHeroProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  summary?: string;
};

export function PageHero({
  title,
  subtitle,
  eyebrow = "Grey Collective Development",
  summary,
}: PageHeroProps) {
  return (
    <header className="relative max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-900 sm:text-[2rem] sm:leading-tight dark:text-stone-50">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        {subtitle}
      </p>
      {summary ? (
        <p className="mt-5 border-l-2 border-stone-900/15 pl-4 text-xs font-medium leading-relaxed text-stone-700 dark:border-stone-100/20 dark:text-stone-300">
          {summary}
        </p>
      ) : null}
    </header>
  );
}
