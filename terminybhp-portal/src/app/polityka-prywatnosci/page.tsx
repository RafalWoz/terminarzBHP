import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description: "Informacje o prywatności i analityce na stronie TerminyBHP.pl.",
  alternates: { canonical: canonicalUrl("/polityka-prywatnosci/") },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-5 py-12 sm:px-6 lg:py-16">
      <article className="rounded-[28px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)] sm:p-9">
        <h1 className="text-4xl font-black tracking-[-0.05em] text-[var(--navy-950)]">Polityka prywatności</h1>
        <p className="mt-5 leading-7 text-[var(--slate-700)]">
          TerminyBHP.pl udostępnia publiczną bazę wiedzy oraz odrębny serwis do pilnowania terminów BHP.
          Ta strona informacyjna opisuje zasady dotyczące publicznego portalu i bloga.
        </p>
        <h2 className="mt-8 text-2xl font-black text-[var(--navy-950)]">Analityka strony</h2>
        <p className="mt-3 leading-7 text-[var(--slate-700)]">
          Po wyrażeniu zgody uruchamiamy Google Analytics, aby sprawdzać, które treści są czytane i jak
          ulepszać portal. Analityka nie uruchamia się przed zgodą. Zgodę można odrzucić albo zmienić
          później przez link „Ustawienia analityki” w stopce.
        </p>
        <h2 className="mt-8 text-2xl font-black text-[var(--navy-950)]">Pliki i pamięć przeglądarki</h2>
        <p className="mt-3 leading-7 text-[var(--slate-700)]">
          Portal zapisuje wybór dotyczący analityki w pamięci przeglądarki. Dzięki temu nie pyta o zgodę
          przy każdej wizycie. Po zaakceptowaniu analityki Google Analytics może korzystać z własnych
          mechanizmów pomiarowych zgodnie z udzieloną zgodą.
        </p>
        <h2 className="mt-8 text-2xl font-black text-[var(--navy-950)]">Treści zewnętrzne</h2>
        <p className="mt-3 leading-7 text-[var(--slate-700)]">
          Artykuły mogą zawierać linki do zewnętrznych źródeł, między innymi instytucji publicznych.
          Po przejściu na taką stronę obowiązują jej własne zasady prywatności.
        </p>
        <h2 className="mt-8 text-2xl font-black text-[var(--navy-950)]">Kontakt i dane administratora</h2>
        <p className="mt-3 leading-7 text-[var(--slate-700)]">
          Dane identyfikacyjne administratora oraz kanał kontaktu należy uzupełnić przed komercyjnym
          uruchomieniem serwisu. Do tego czasu portal nie powinien służyć do przyjmowania danych osobowych
          przez formularze kontaktowe.
        </p>
        <p className="mt-8 text-sm font-semibold text-[var(--slate-700)]">Ostatnia aktualizacja: 2 czerwca 2026 r.</p>
      </article>
    </main>
  );
}
