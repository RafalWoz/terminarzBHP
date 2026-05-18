import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} TerminyBHP. Publiczna baza wiedzy i serwis terminów BHP.</p>
        <div className="flex gap-4">
          <Link href="/blog" className="hover:text-slate-950">
            Blog
          </Link>
          <Link href="/serwis/" className="hover:text-slate-950">
            Serwis
          </Link>
        </div>
      </div>
    </footer>
  );
}
