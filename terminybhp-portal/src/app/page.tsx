import Link from "next/link";
import { getAllPosts, templates, tools } from "@/lib/content";

const brandRoles = [
  {
    label: "Rola",
    value: "Baza wiedzy i serwis pilnujący terminów BHP w jednym miejscu.",
  },
  {
    label: "Ton",
    value: "Ekspercki i neutralny. Mówimy konkretnie, bez straszenia.",
  },
  {
    label: "Dla kogo",
    value: "HR, kadry i małe firmy, które same prowadzą sprawy BHP.",
  },
  {
    label: "Cel",
    value: "Pomóc podjąć dobrą decyzję. Sprzedaż schodzi na drugi plan.",
  },
];

const pillars = [
  {
    number: "01",
    label: "Serwis",
    title: "Terminy i pracownicy",
    description:
      "Prywatna aplikacja porządkuje firmy, pracowników, badania, szkolenia, uprawnienia i audyty. Widzisz, co jest aktualne, a co wymaga reakcji — zanim termin minie.",
  },
  {
    number: "02",
    label: "Blog",
    title: "Treści publiczne",
    description:
      "Artykuły prowadzą od pytania do decyzji: co sprawdzić, kiedy działać i gdzie zapisać termin. Każdy wpis kończy się konkretem, nie ogólnikiem.",
  },
  {
    number: "03",
    label: "Zasoby",
    title: "Narzędzia i szablony",
    description:
      "Publiczne dodatki pomagają przejść od wiedzy do działania — gotowy rejestr, checklista albo szybkie wyliczenie zamiast pustej kartki.",
  },
];

const comparison = [
  {
    title: "Blog",
    visibility: "publiczny",
    headline: "Wiedza, którą czytasz raz",
    points: [
      "Tłumaczy, co i kiedy trzeba zrobić",
      "Prowadzi od pytania do decyzji",
      "Bez logowania, otwarte dla każdego",
      "Narzędzia i szablony pod ręką",
    ],
  },
  {
    title: "Serwis",
    visibility: "prywatny, wersja demo",
    headline: "System, który pilnuje za Ciebie",
    points: [
      "Firmy, pracownicy i ich terminy w jednym widoku",
      "Badania, szkolenia, uprawnienia i audyty",
      "Sygnał, zanim termin się skończy",
      "Dostęp prywatny, dane Twojej firmy",
    ],
  },
];

export default function Home() {
  const latestPost = getAllPosts()[0];

  return (
    <main>
      <section className="border-b border-[var(--slate-200)] bg-[linear-gradient(180deg,#fff,var(--paper))]">
        <div className="mx-auto grid max-w-[1160px] gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--slate-200)] bg-white px-3 py-2 text-sm font-extrabold text-[var(--teal-700)]">
              <span className="size-2 rounded-full bg-[var(--teal-600)]" />
              Baza wiedzy + serwis terminów
            </span>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.96] tracking-[-0.06em] text-[var(--navy-950)] sm:text-6xl lg:text-7xl">
              TerminyBHP.pl — wiedza, która kończy się decyzją, a nie kolejnym pytaniem.
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-[var(--slate-700)]">
              Jeden adres, dwie potrzeby. Publiczny blog porządkuje to, co trzeba wiedzieć o BHP. Serwis pod /serwis/ pilnuje, żeby żaden termin badania, szkolenia czy uprawnienia nie umknął.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--slate-600)]">
              Bez żargonu i bez presji. Tłumaczymy, co sprawdzić i kiedy działać — resztę zostawiamy Tobie.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/blog" className="inline-flex justify-center rounded-[14px] bg-[var(--teal-600)] px-5 py-3 text-sm font-extrabold text-white hover:bg-[var(--teal-700)]">
                Czytaj blog
              </Link>
              <Link href="/serwis/" className="inline-flex justify-center rounded-[14px] border border-[var(--slate-200)] bg-white px-5 py-3 text-sm font-extrabold text-[var(--navy-900)] hover:border-[var(--slate-500)]">
                Przejdź do serwisu
              </Link>
            </div>
          </div>

          <aside className="rounded-[28px] bg-[var(--navy-900)] p-7 text-white shadow-[var(--shadow-soft)]">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#b9cad8]">Serwis w budowie</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Wersja demo jest już dostępna pod /serwis/.</h2>
            <p className="mt-4 leading-7 text-[#d8e3ea]">
              Możesz zobaczyć kierunek aplikacji i sposób porządkowania terminów. To nie jest jeszcze finalny produkt ani miejsce na docelowe dane firmowe.
            </p>
          </aside>
        </div>
      </section>

      <section className="border-b border-[var(--slate-200)] bg-white">
        <div className="mx-auto max-w-[1160px] px-5 py-10 sm:px-6">
          <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--teal-700)]">Założenie marki</p>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {brandRoles.map((item) => (
              <section key={item.label} className="rounded-[20px] border border-[var(--slate-200)] bg-[var(--paper)] p-5">
                <h2 className="text-sm font-black uppercase tracking-[0.08em] text-[var(--navy-950)]">{item.label}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--slate-700)]">{item.value}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 py-14 sm:px-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--teal-700)]">Jak to działa</p>
        <h2 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.04em] text-[var(--navy-950)]">
          Trzy warstwy, jedno miejsce — od pytania do pilnowanego terminu.
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar) => (
            <section key={pillar.number} className="rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)]">
              <p className="text-sm font-black text-[var(--teal-700)]">{pillar.number} · {pillar.label}</p>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[var(--navy-950)]">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--slate-700)]">{pillar.description}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--slate-200)] bg-white">
        <div className="mx-auto grid max-w-[1160px] gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.74fr_1.26fr]">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--teal-700)]">Najnowszy wpis</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--navy-950)]">Placeholder — do podmiany po publikacji pierwszych artykułów.</h2>
            <p className="mt-4 text-[var(--slate-700)]">
              Blog gotowy pod rozbudowę. Pierwsze wpisy są w kodzie jako dane startowe; kolejne mogą trafiać jako pliki JSON przed statycznym eksportem.
            </p>
          </div>
          <Link href={`/blog/${latestPost.slug}`} className="rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)] hover:border-[var(--slate-500)]">
            <p className="inline-flex rounded-full bg-[var(--green-50)] px-3 py-1.5 text-xs font-extrabold text-[var(--teal-700)]">
              Szkolenia · 4 min czytania
            </p>
            <h3 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-[var(--navy-950)]">
              Szkolenie wstępne BHP: co trzeba dopilnować przed rozpoczęciem pracy
            </h3>
            <p className="mt-3 text-[var(--slate-700)]">
              Praktyczna lista elementów, które muszą znaleźć się w procesie dopuszczenia pracownika do pracy — od instruktażu ogólnego po wpis do rejestru.
            </p>
            <p className="mt-5 text-sm font-extrabold text-[var(--navy-950)]">Czytaj instrukcję</p>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1160px] gap-8 px-5 py-14 sm:px-6 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-[var(--navy-950)]">Narzędzia</h2>
            <Link href="/tools" className="text-sm font-extrabold text-[var(--teal-700)] hover:text-[var(--navy-950)]">
              Zobacz wszystkie
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {tools.slice(0, 2).map((tool) => (
              <div key={tool.title} className="rounded-[20px] border border-[var(--slate-200)] bg-white p-5">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--teal-700)]">{tool.status}</p>
                <h3 className="mt-2 font-black text-[var(--navy-950)]">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--slate-700)]">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black tracking-[-0.04em] text-[var(--navy-950)]">Szablony</h2>
            <Link href="/templates" className="text-sm font-extrabold text-[var(--teal-700)] hover:text-[var(--navy-950)]">
              Zobacz wszystkie
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {templates.slice(0, 2).map((template) => (
              <div key={template.title} className="rounded-[20px] border border-[var(--slate-200)] bg-white p-5">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--teal-700)]">{template.status}</p>
                <h3 className="mt-2 font-black text-[var(--navy-950)]">{template.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--slate-700)]">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--slate-200)] bg-[var(--paper)]">
        <div className="mx-auto max-w-[1160px] px-5 py-14 sm:px-6">
          <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--teal-700)]">Dwie strony tego samego adresu</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.04em] text-[var(--navy-950)]">
            Najpierw zrozum, potem przestań pamiętać o terminach.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {comparison.map((card) => (
              <section key={card.title} className="rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)]">
                <p className="text-sm font-black text-[var(--teal-700)]">{card.title} <span className="text-[var(--slate-500)]">({card.visibility})</span></p>
                <h3 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[var(--navy-950)]">{card.headline}</h3>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--slate-700)]">
                  {card.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--teal-600)]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
