import Link from "next/link";

const navItems = [
  { href: "/blog", label: "Blog" },
  { href: "/tools", label: "Narzędzia" },
  { href: "/templates", label: "Szablony" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-slate-950">
          TerminyBHP
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-slate-950">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/serwis/"
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Serwis
        </Link>
      </div>
    </header>
  );
}
