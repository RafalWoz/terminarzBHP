import type { ReactNode } from "react";
import Link from "next/link";
import { canonicalUrl } from "@/lib/seo";

export const metadata = {
  alternates: { canonical: canonicalUrl("/") },
};

const statusRows = [
  { tone: "late", title: "Badania okresowe", person: "Kowalski J. · Firma ALFA", status: "Po terminie", days: "−12 dni" },
  { tone: "soon", title: "Szkolenie okresowe BHP", person: "Nowak A. · Firma BETA", status: "Wkrótce", days: "za 9 dni" },
  { tone: "soon", title: "Audyt roczny", person: "Firma ALFA", status: "Wkrótce", days: "za 21 dni" },
  { tone: "ok", title: "Uprawnienia UDT", person: "Wiśniewski P. · Firma GAMMA", status: "Aktualne", days: "214 dni" },
];

const legendItems = [
  { tone: "ok", title: "Aktualne", description: "nic nie robisz" },
  { tone: "soon", title: "Wkrótce", description: "zaplanuj w tym miesiącu" },
  { tone: "late", title: "Po terminie", description: "reaguj dziś" },
];

const audienceCards = [
  {
    variant: "primary",
    tag: "Główny odbiorca serwisu",
    title: "Prowadzisz BHP dla kilku firm",
    description: "Behapowiec, biuro kadr lub firma outsourcingowa. Pilnujesz dziesiątek terminów u różnych klientów — i jeden zgubiony to Twoja odpowiedzialność.",
    points: [
      "Wszystkie firmy i pracownicy w jednym widoku",
      "Status liczony automatycznie zamiast w arkuszach",
      "Sygnał, zanim termin u klienta minie",
      "Dane klientów zaszyfrowane i trzymane na Twoim dysku",
      "Audyt i raport gotowy na kontrolę PIP",
    ],
    note: "Wersja demo do testów · 0 zł",
  },
  {
    variant: "secondary",
    tag: "Odbiorca bloga",
    title: "Odpowiadasz za BHP przy okazji",
    description: "Właściciel małej firmy albo osoba z HR bez działu BHP. Chcesz wiedzieć, co sprawdzić i kiedy działać — bez wczytywania się w każdy przepis.",
    points: [
      "Instrukcje bez żargonu i straszenia paragrafami",
      "Każdy wpis prowadzi do konkretnego kroku",
      "Baza wiedzy pod ręką",
      "A gdy terminów robi się za dużo — przejście do serwisu",
    ],
    note: "",
  },
];

const serviceSteps = [
  { number: "01", title: "Dodaj firmy i ludzi", description: "Firmy klientów oraz pracowników z podstawowymi danymi." },
  { number: "02", title: "Wpisz terminy", description: "Badania, szkolenia i uprawnienia z datami ważności." },
  { number: "03", title: "Status liczy się sam", description: "Aktualne, wkrótce, po terminie — bez ręcznego liczenia." },
  { number: "04", title: "Dostajesz sygnał", description: "Wiesz o terminie, zanim minie, a nie po fakcie." },
  { number: "05", title: "Audyt i raport", description: "Checklista, uchybienia i gotowy raport na kontrolę." },
];

const posts = [
  {
    category: "Szkolenia · 4 min",
    title: "Szkolenie wstępne BHP: co dopilnować przed pierwszym dniem pracy",
    description: "Lista elementów od instruktażu ogólnego po wpis do rejestru — krok po kroku.",
    next: "Następny krok → szkolenie online",
  },
  {
    category: "Badania · 3 min",
    title: "Badania lekarskie pracowników: jak nie zgubić terminów",
    description: "Wstępne, okresowe i kontrolne — kiedy zlecić i jak je monitorować.",
    next: "Następny krok → pakiet badań",
  },
  {
    category: "Organizacja · 5 min",
    title: "Rejestr terminów BHP: co trzymać w jednym miejscu",
    description: "Szkolenia, badania, uprawnienia i audyty w jednym uporządkowanym rejestrze.",
    next: "Następny krok → szablon rejestru",
  },
];

const dataRows = [
  { label: "Twoje dane", value: "na Twoim dysku", tone: "ok" },
  { label: "Plik bazy", value: "zaszyfrowany", tone: "ok" },
  { label: "Zewnętrzny serwer", value: "nie używamy", tone: "late" },
  { label: "Koszt", value: "0 zł", tone: "ok" },
];

const toneStyles = {
  ok: {
    dot: "bg-[#2E7D5B]",
    border: "border-l-[#2E7D5B]",
    pill: "bg-[#E4F0E8] text-[#2E7D5B]",
    darkPill: "bg-[#2E7D5B]/20 text-[#7FD3AC]",
  },
  soon: {
    dot: "bg-[#B5781A]",
    border: "border-l-[#B5781A]",
    pill: "bg-[#F6ECD8] text-[#B5781A]",
    darkPill: "bg-[#B5781A]/20 text-[#EBC077]",
  },
  late: {
    dot: "bg-[#BE3E32]",
    border: "border-l-[#BE3E32]",
    pill: "bg-[#F8E2DE] text-[#BE3E32]",
    darkPill: "bg-[#BE3E32]/20 text-[#F3A89E]",
  },
};

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#9FD8C2]" : "text-[var(--teal-700)]"}`}>
      <span className={`size-2 rounded-full ${dark ? "bg-[#46C28F]" : "bg-[#2E7D5B]"}`} />
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <main>
      <section className="px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto grid max-w-[1160px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Eyebrow>Serwis + baza wiedzy BHP</Eyebrow>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[var(--navy-950)] sm:text-6xl lg:text-7xl">
              Koniec z pilnowaniem terminów BHP w głowie i w Excelu.
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-[var(--slate-700)]">
              Serwis trzyma badania, szkolenia, uprawnienia i audyty wszystkich Twoich firm w jednym widoku — i daje znać, zanim którykolwiek termin minie.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--slate-600)]">
              Status liczy się sam. Reagujesz wtedy, kiedy trzeba — nie wtedy, kiedy zadzwoni kontrola.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/serwis/" className="inline-flex justify-center rounded-[14px] bg-[var(--teal-600)] px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(14,145,139,0.2)] hover:bg-[var(--teal-700)]">
                Otwórz serwis →
              </a>
              <Link href="/blog/" className="inline-flex justify-center rounded-[14px] border border-[var(--slate-200)] bg-white px-5 py-3 text-sm font-extrabold text-[var(--navy-900)] hover:border-[var(--slate-500)]">
                Czytaj blog BHP
              </Link>
            </div>
            <p className="mt-5 font-mono text-xs text-[var(--slate-600)]">
              ● Wersja demo do testów · ● Dane zostają na Twoim dysku
            </p>
          </div>

          <aside className="rounded-[24px] bg-[#0E1F19] p-6 text-[#EAF1EC] shadow-[0_30px_60px_-30px_rgba(14,31,25,0.55)]" aria-label="Podgląd serwisu: lista terminów">
            <div className="mb-2 flex items-center justify-between gap-4">
              <p className="text-lg font-black tracking-[-0.03em]">Twoje terminy</p>
              <span className="rounded-full border border-[#25453A] px-3 py-1 font-mono text-xs text-[#8FB7A7]">3 firmy · 28 osób</span>
            </div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-[#6E9686]">Stan na dziś · automatyczny</p>
            <div className="space-y-2">
              {statusRows.map((row) => (
                <div key={`${row.title}-${row.person}`} className={`grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 rounded-[14px] border-l-4 bg-[#13261F] px-4 py-3 ${toneStyles[row.tone as keyof typeof toneStyles].border}`}>
                  <p className="font-bold text-[#F3F8F4]">{row.title}</p>
                  <span className={`rounded-full px-3 py-1 font-mono text-xs font-bold ${toneStyles[row.tone as keyof typeof toneStyles].darkPill}`}>{row.status}</span>
                  <p className="font-mono text-xs text-[#82A899]">{row.person}</p>
                  <p className="justify-self-end font-mono text-xs text-[#6E9686]">{row.days}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 font-mono text-xs text-[#8FB7A7]">← 1 termin wymaga reakcji dzisiaj</p>
          </aside>
        </div>
      </section>

      <section className="border-y border-[var(--slate-200)] bg-white px-5 sm:px-6">
        <div className="mx-auto flex max-w-[1160px] flex-wrap justify-center gap-6 py-5 md:gap-10">
          {legendItems.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span className={`size-3 rounded-full ${toneStyles[item.tone as keyof typeof toneStyles].dot}`} />
              <strong className="text-sm text-[var(--navy-950)]">{item.title}</strong>
              <span className="text-sm text-[var(--slate-600)]">— {item.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-10 max-w-3xl">
            <Eyebrow>Dla kogo</Eyebrow>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[var(--navy-950)] sm:text-5xl">
              Dwa rodzaje osób, jeden problem: terminy, których nie wolno przegapić.
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--slate-700)]">
              Serwis powstał dla tych, którzy odpowiadają za to, żeby wszystko się zgadzało — niezależnie od tego, czy robią BHP zawodowo, czy przy okazji.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            {audienceCards.map((card) => (
              <section key={card.title} className={`rounded-[24px] border p-7 ${card.variant === "primary" ? "border-[#bfe0d0] bg-[linear-gradient(180deg,#fff,#F1F8F3)]" : "border-[var(--slate-200)] bg-white"}`}>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[var(--teal-700)]">{card.tag}</p>
                <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--navy-950)]">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--slate-700)]">{card.description}</p>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--navy-950)]">
                  {card.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 size-2 shrink-0 rounded-full bg-[#2E7D5B]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                {card.note && <p className="mt-6 inline-flex rounded-[12px] border border-dashed border-[#aacdbb] px-4 py-2 font-mono text-sm font-semibold text-[var(--teal-700)]">← {card.note}</p>}
              </section>
            ))}
          </div>
        </div>
      </section>

      <section id="serwis" className="px-5 pb-16 sm:px-6 lg:pb-20">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-10 max-w-3xl">
            <Eyebrow>Jak działa serwis</Eyebrow>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[var(--navy-950)] sm:text-5xl">
              Od pustej tabeli do pilnowanego terminu — w pięciu krokach.
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--slate-700)]">Wpisujesz dane raz. Status i przypomnienia serwis liczy za Ciebie.</p>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[var(--slate-200)] bg-white md:grid md:grid-cols-5">
            {serviceSteps.map((step) => (
              <section key={step.number} className="border-b border-[var(--slate-200)] p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <p className="font-mono text-xs font-bold text-[var(--teal-700)]">{step.number}</p>
                <h3 className="mt-4 text-xl font-black leading-tight tracking-[-0.03em] text-[var(--navy-950)]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--slate-700)]">{step.description}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="border-y border-[var(--slate-200)] bg-white px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-10 max-w-3xl">
            <Eyebrow>Blog BHP</Eyebrow>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[var(--navy-950)] sm:text-5xl">
              Zacznij od pytania, które masz teraz — wyjdź z odpowiedzią i kolejnym krokiem.
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--slate-700)]">
              Każdy wpis prowadzi od problemu do działania: co sprawdzić, kiedy zadziałać i czym się wesprzeć.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <article key={post.title} className="flex flex-col rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_30px_-22px_rgba(19,33,28,0.4)]">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--slate-600)]">{post.category}</p>
                <h3 className="mt-3 text-xl font-black leading-tight tracking-[-0.03em] text-[var(--navy-950)]">{post.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-[var(--slate-700)]">{post.description}</p>
                <p className="mt-5 inline-flex self-start rounded-[12px] bg-[#E4F0E8] px-3 py-2 font-mono text-xs font-bold text-[var(--teal-700)]">{post.next}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto grid max-w-[1160px] gap-8 rounded-[28px] bg-[#0E1F19] p-8 text-[#EAF1EC] shadow-[0_30px_60px_-30px_rgba(14,31,25,0.55)] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
          <div>
            <Eyebrow dark>Serwis · demo do testów</Eyebrow>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Działa w przeglądarce. Zapisuje na Twoim dysku.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#B7CCC2]">
              TerminyBHP nie wysyła danych firm i pracowników na żaden zewnętrzny serwer. Przy pierwszym wejściu wskazujesz folder, a serwis trzyma w nim jeden zaszyfrowany plik z całą bazą — pod Twoją kontrolą. Kopia zapasowa to po prostu skopiowanie tego pliku. Obecnie działa jako wersja demo do testów.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="/serwis/" className="inline-flex justify-center rounded-[14px] bg-[#2E9A77] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#26815f]">Otwórz serwis →</a>
              <a href="#serwis" className="inline-flex justify-center rounded-[14px] border border-[#2C4C40] px-5 py-3 text-sm font-extrabold text-[#EAF1EC] hover:border-[#6E9686]">Jak działa zapis danych</a>
            </div>
          </div>
          <div className="rounded-[20px] border border-[#234035] bg-[#13261F] p-5">
            {dataRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 border-b border-[#20382E] py-3 text-sm last:border-b-0">
                <span className="text-[#CFE0D8]">{row.label}</span>
                <span className={`rounded-full px-3 py-1 font-mono text-xs font-bold ${toneStyles[row.tone as keyof typeof toneStyles].darkPill}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
