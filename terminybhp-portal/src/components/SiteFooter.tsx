import Link from "next/link";
import { AnalyticsConsentLink } from "@/components/AnalyticsConsentLink";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[var(--navy-950)] text-white">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-6 px-5 py-10 text-sm text-[#b9cad8] sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="text-base font-black tracking-[-0.03em] text-white">TerminyBHP</p>
          <p className="mt-2 max-w-xl">
            Publiczna baza wiedzy i darmowy, lokalny system pilnowania terminów BHP. Twoje dane zostają na Twoim dysku.
          </p>
          <p className="mt-3 max-w-xl text-xs leading-5">
            Treści mają charakter informacyjny i nie zastępują obowiązującej dokumentacji ani konsultacji ze specjalistą BHP.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 font-semibold">
          <Link href="/#serwis" className="hover:text-white">
            Serwis
          </Link>
          <Link href="/blog/" className="hover:text-white">
            Blog
          </Link>
          <Link href="/polityka-prywatnosci/" className="hover:text-white">
            Polityka prywatności
          </Link>
          <AnalyticsConsentLink />
        </div>
      </div>
    </footer>
  );
}
