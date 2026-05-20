import Link from "next/link";

const navItems = [
  { href: "/blog", label: "Blog" },
  { href: "/tools", label: "Narzędzia" },
  { href: "/templates", label: "Szablony" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--slate-200)] bg-[rgba(251,252,253,0.9)] backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1160px] items-center justify-between gap-5 px-5 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-lg font-black tracking-[-0.03em] text-[var(--navy-950)]">
          <span className="grid size-10 place-items-center rounded-[14px] bg-[linear-gradient(135deg,var(--navy-900),var(--teal-600))] text-base font-black text-white">
            T
          </span>
          TerminyBHP
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--slate-700)] sm:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[var(--navy-950)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/serwis/"
          className="rounded-[14px] bg-[var(--teal-600)] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(14,145,139,0.2)] transition hover:bg-[var(--teal-700)]"
        >
          Serwis
        </Link>
      </div>
    </header>
  );
}
