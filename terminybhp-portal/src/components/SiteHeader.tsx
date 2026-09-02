"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/#serwis", label: "Serwis" },
  { href: "/blog/", label: "Blog" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--slate-200)] bg-[rgba(251,252,253,0.9)] backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1160px] items-center justify-between gap-5 px-5 sm:px-6">
        <Link href="/" onClick={closeMenu} className="text-lg font-black tracking-[-0.03em] text-[var(--navy-950)]">
          TerminyBHP
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--slate-700)] sm:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[var(--navy-950)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="/serwis/"
          className="hidden rounded-[14px] bg-[var(--teal-600)] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(14,145,139,0.2)] transition hover:bg-[var(--teal-700)] sm:inline-flex"
        >
          Wypróbuj demo
        </a>

        <button
          type="button"
          aria-label={isOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex size-11 items-center justify-center rounded-[14px] border border-[var(--slate-200)] bg-white text-[var(--navy-950)] shadow-[0_8px_20px_rgba(7,24,38,0.06)] sm:hidden"
        >
          <span className="sr-only">Menu</span>
          <span className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-[var(--slate-200)] bg-white px-5 py-4 shadow-[0_18px_40px_rgba(7,24,38,0.08)] sm:hidden">
          <nav className="mx-auto flex max-w-[1160px] flex-col gap-2 text-sm font-extrabold text-[var(--navy-950)]">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMenu} className="rounded-[14px] px-4 py-3 hover:bg-[var(--paper)]">
                {item.label}
              </Link>
            ))}
            <a
              href="/serwis/"
              onClick={closeMenu}
              className="mt-2 rounded-[14px] bg-[var(--teal-600)] px-4 py-3 text-center text-white shadow-[0_10px_24px_rgba(14,145,139,0.2)] hover:bg-[var(--teal-700)]"
            >
              Wypróbuj demo
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
