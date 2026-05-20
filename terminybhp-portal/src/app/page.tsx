import Link from "next/link";
import { getAllPosts, templates, tools } from "@/lib/content";

export default function Home() {
  const latestPost = getAllPosts()[0];

  return (
    <main>
      <section className="border-b border-[var(--slate-200)] bg-[linear-gradient(180deg,#fff,var(--paper))]">
        <div className="mx-auto grid max-w-[1160px] gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--slate-200)] bg-white px-3 py-2 text-sm font-extrabold text-[var(--teal-700)]">
              <span className="size-2 rounded-full bg-[var(--teal-600)]" />
              TerminyBHP.pl
            </span>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.96] tracking-[-0.06em] text-[var(--navy-950)] sm:text-6xl lg:text-7xl">
              Baza wiedzy i serwis terminów BHP dla firm.
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-[var(--slate-700)]">
              Jeden adres dla dwóch potrzeb: publiczny blog porządkuje decyzje, a aplikacja pod /serwis/ pomaga pilnować pracowników, szkoleń, badań i uprawnień.
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
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#b9cad8]">Założenie marki</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-[#b9cad8]">Rola</dt>
                <dd className="mt-1 font-extrabold">baza wiedzy + serwis terminów</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-[#b9cad8]">Ton</dt>
                <dd className="mt-1 font-extrabold">ekspercki, neutralny</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-[#b9cad8]">Dla kogo</dt>
                <dd className="mt-1 font-extrabold">HR, kadry, małe firmy</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-[#b9cad8]">Cel</dt>
                <dd className="mt-1 font-extrabold">decyzja, nie presja sprzedaży</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 py-14 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Serwis", "Terminy i pracownicy", "Prywatna aplikacja porządkuje firmy, pracowników, badania, szkolenia, uprawnienia i audyty."],
            ["Blog", "Treści publiczne", "Artykuły prowadzą od pytania do decyzji: co sprawdzić, kiedy działać i gdzie zapisać termin."],
            ["Zasoby", "Narzędzia i szablony", "Publiczne dodatki pomagają przejść od wiedzy do konkretnego rejestru, checklisty albo działania."],
          ].map(([eyebrow, title, description]) => (
            <section key={title} className="rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)]">
              <p className="text-sm font-extrabold text-[var(--teal-700)]">{eyebrow}</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--navy-950)]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--slate-700)]">{description}</p>
            </section>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--slate-200)] bg-white">
        <div className="mx-auto grid max-w-[1160px] gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--teal-700)]">Najnowszy wpis</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--navy-950)]">Blog gotowy pod rozbudowę</h2>
            <p className="mt-4 text-[var(--slate-700)]">
              Pierwsze wpisy są w kodzie jako dane startowe. Kolejne mogą trafiać jako pliki JSON przed statycznym eksportem.
            </p>
          </div>
          <Link href={`/blog/${latestPost.slug}`} className="rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)] hover:border-[var(--slate-500)]">
            <p className="inline-flex rounded-full bg-[var(--green-50)] px-3 py-1.5 text-xs font-extrabold text-[var(--teal-700)]">
              {latestPost.category} · {latestPost.readingTime}
            </p>
            <h3 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-[var(--navy-950)]">{latestPost.title}</h3>
            <p className="mt-3 text-[var(--slate-700)]">{latestPost.description}</p>
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
                <h3 className="font-black text-[var(--navy-950)]">{tool.title}</h3>
                <p className="mt-2 text-sm text-[var(--slate-700)]">{tool.description}</p>
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
                <h3 className="font-black text-[var(--navy-950)]">{template.title}</h3>
                <p className="mt-2 text-sm text-[var(--slate-700)]">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
