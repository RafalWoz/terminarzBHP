import type { ReactNode } from "react";
import Link from "next/link";
import { getAllPosts, type BlogPost } from "@/lib/content";
import { canonicalUrl } from "@/lib/seo";

export const metadata = {
  title: "Blog BHP - instrukcje bez żargonu, od pytania do kroku",
  description: "Blog TerminyBHP: praktyczne instrukcje BHP bez żargonu. Szkolenia, badania, dokumentacja, ocena ryzyka, audyty i organizacja terminów.",
  alternates: { canonical: canonicalUrl("/blog/") },
};

const topicChips = ["Wszystko", "Szkolenia", "Badania", "Dokumentacja", "Ocena ryzyka", "Audyty", "Organizacja terminów"];

const decisionRows = [
  { question: "Kiedy zrobić szkolenie okresowe?", answer: "licz od ostatniego szkolenia + cykl dla stanowiska" },
  { question: "Czy te badania są jeszcze ważne?", answer: "sprawdź datę na orzeczeniu, nie na skierowaniu" },
  { question: "Co zapisać w dokumentacji?", answer: "gotowa lista do odhaczenia w każdym wpisie" },
  { question: "Kiedy przejść do serwisu?", answer: "gdy terminów jest za dużo, by trzymać je w głowie" },
];

const featuredQuestions = [
  { question: "Kto może przeprowadzić instruktaż?", answer: "i co musi trafić do akt pracownika" },
  { question: "Czy szkolenie online wystarczy?", answer: "dla których stanowisk tak, dla których nie" },
];

const demoRows = [
  { label: "Badania okresowe · Kowalski J.", value: "po terminie", tone: "late" },
  { label: "Szkolenie BHP · Nowak A.", value: "za 9 dni", tone: "soon" },
  { label: "Uprawnienia UDT · Wiśniewski P.", value: "aktualne", tone: "ok" },
  { label: "Koszt", value: "0 zł", tone: "ok" },
];

const toneStyles = {
  ok: "bg-[#2E7D5B]/20 text-[#7FD3AC]",
  soon: "bg-[#B5781A]/20 text-[#EBC077]",
  late: "bg-[#BE3E32]/20 text-[#F3A89E]",
};

function nextStepFor(post: BlogPost) {
  const text = `${post.category} ${post.title}`.toLowerCase();
  if (text.includes("szkol")) return "Następny krok → szkolenie online";
  if (text.includes("badan") || text.includes("lekars")) return "Następny krok → pakiet badań / medycyna pracy";
  if (text.includes("ryzyk")) return "Następny krok → wzór oceny ryzyka";
  if (text.includes("audyt")) return "Następny krok → checklista audytu";
  if (text.includes("rejestr") || text.includes("termin")) return "Następny krok → szablon rejestru";
  return "Następny krok → uporządkuj terminy w serwisie";
}

function postUrl(slug: string) {
  return `/blog/${slug}/`;
}

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#9FD8C2]" : "text-[var(--teal-700)]"}`}>
      <span className={`size-2 rounded-full ${dark ? "bg-[#46C28F]" : "bg-[#2E7D5B]"}`} />
      {children}
    </span>
  );
}

export default function BlogPage() {
  const posts = getAllPosts();
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <main>
      <section className="px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto grid max-w-[1160px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Eyebrow>Baza wiedzy BHP · za darmo, bez logowania</Eyebrow>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[var(--navy-950)] sm:text-6xl lg:text-7xl">
              Instrukcje BHP bez żargonu — od pytania do gotowego kroku.
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-[var(--slate-700)]">
              Trafiłeś tu z konkretnym pytaniem: kiedy zrobić szkolenie, czy badania są jeszcze ważne, co wpisać do dokumentacji. Każdy wpis prowadzi Cię do odpowiedzi i pokazuje, co zrobić dalej.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={featuredPost ? postUrl(featuredPost.slug) : "#wpisy"} className="inline-flex justify-center rounded-[14px] bg-[var(--teal-600)] px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(14,145,139,0.22)] hover:bg-[var(--teal-700)]">
                Czytaj najnowszy wpis →
              </Link>
              <a href="/serwis/" className="inline-flex justify-center rounded-[14px] border border-[var(--slate-200)] bg-white px-5 py-3 text-sm font-extrabold text-[var(--navy-900)] hover:border-[var(--slate-500)]">
                Zobacz darmowy serwis terminów
              </a>
            </div>
          </div>

          <aside className="rounded-[24px] bg-[#0E1F19] p-6 text-[#EAF1EC] shadow-[0_30px_60px_-30px_rgba(14,31,25,0.55)]" aria-label="Od pytania do decyzji">
            <p className="text-lg font-black tracking-[-0.03em]">Od pytania do decyzji</p>
            <p className="mb-4 mt-1 font-mono text-xs uppercase tracking-[0.08em] text-[#6E9686]">tak czyta się każdy wpis</p>
            <div className="space-y-2">
              {decisionRows.map((row) => (
                <div key={row.question} className="rounded-[14px] border-l-4 border-l-[#2E7D5B] bg-[#13261F] px-4 py-3">
                  <p className="font-bold text-[#F3F8F4]">{row.question}</p>
                  <p className="mt-1 font-mono text-xs text-[#82A899]">↳ {row.answer}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-[var(--slate-200)] bg-white px-5 sm:px-6">
        <div className="mx-auto flex max-w-[1160px] flex-wrap gap-2 py-5">
          {topicChips.map((chip, index) => (
            <span key={chip} className={`rounded-full border px-4 py-2 font-mono text-xs font-semibold ${index === 0 ? "border-[var(--teal-600)] bg-[var(--teal-600)] text-white" : "border-[var(--slate-200)] bg-[var(--paper)] text-[var(--slate-600)]"}`}>
              {chip}
            </span>
          ))}
        </div>
      </section>

      <section id="wpisy" className="mx-auto max-w-[1160px] px-5 py-16 sm:px-6 lg:py-20">
        <div className="mb-10 max-w-3xl">
          <Eyebrow>Wpisy</Eyebrow>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[var(--navy-950)] sm:text-5xl">Praktyczne instrukcje BHP</h2>
          <p className="mt-4 text-lg leading-8 text-[var(--slate-700)]">
            Każdy wpis prowadzi do jednego działania: sprawdzić termin, przygotować dokument albo uporządkować rejestr. Na końcu znajdziesz następny krok.
          </p>
        </div>

        {featuredPost && (
          <article className="mb-6 overflow-hidden rounded-[24px] border border-[var(--slate-200)] bg-white lg:grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-7 lg:p-9">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--teal-700)]">
                {featuredPost.category} · {featuredPost.readingTime} · Najnowszy
              </p>
              <h3 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-[var(--navy-950)] sm:text-4xl">{featuredPost.title}</h3>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--slate-700)]">{featuredPost.description}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={postUrl(featuredPost.slug)} className="inline-flex font-bold text-[var(--teal-700)] hover:text-[var(--navy-950)]">
                  Czytaj instrukcję →
                </Link>
                <span className="inline-flex self-start rounded-[12px] bg-[#E4F0E8] px-3 py-2 font-mono text-xs font-bold text-[var(--teal-700)]">
                  {nextStepFor(featuredPost)}
                </span>
              </div>
            </div>
            <aside className="flex flex-col justify-center gap-5 bg-[#0E1F19] p-7 text-[#EAF1EC] lg:p-9">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#7FB39F]">Wpis odpowiada na</p>
              {featuredQuestions.map((item) => (
                <div key={item.question}>
                  <p className="font-bold">{item.question}</p>
                  <p className="mt-1 text-sm text-[#9FBDB0]">{item.answer}</p>
                </div>
              ))}
            </aside>
          </article>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {remainingPosts.map((post) => (
            <article key={post.slug} className="flex flex-col rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_30px_-22px_rgba(19,33,28,0.4)]">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--slate-600)]">{post.category} · {post.readingTime}</p>
              <h3 className="mt-3 text-xl font-black leading-tight tracking-[-0.03em] text-[var(--navy-950)]">{post.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-[var(--slate-700)]">{post.description}</p>
              <div className="mt-5 flex flex-col gap-3">
                <span className="inline-flex self-start rounded-[12px] bg-[#E4F0E8] px-3 py-2 font-mono text-xs font-bold text-[var(--teal-700)]">{nextStepFor(post)}</span>
                <Link href={postUrl(post.slug)} className="inline-flex font-bold text-[var(--teal-700)] hover:text-[var(--navy-950)]">
                  Czytaj instrukcję →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="serwis" className="px-5 pb-16 sm:px-6 lg:pb-20">
        <div className="mx-auto grid max-w-[1160px] gap-8 rounded-[28px] bg-[#0E1F19] p-8 text-[#EAF1EC] shadow-[0_30px_60px_-30px_rgba(14,31,25,0.55)] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
          <div>
            <Eyebrow dark>Serwis · demo do testów</Eyebrow>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
              Przeczytać to pierwszy krok. Drugi to przestać pamiętać o terminach.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#B7CCC2]">
              Gdy wpisów do ogarnięcia robi się więcej, przenieś terminy do serwisu. Liczy status za Ciebie i daje znać, zanim coś minie. Działa w przeglądarce, a dane zapisuje zaszyfrowane na Twoim dysku — nic nie trafia na zewnętrzny serwer.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="/serwis/" className="inline-flex justify-center rounded-[14px] bg-[#2E9A77] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#26815f]">Otwórz serwis →</a>
              <Link href="/#serwis" className="inline-flex justify-center rounded-[14px] border border-[#2C4C40] px-5 py-3 text-sm font-extrabold text-[#EAF1EC] hover:border-[#6E9686]">Jak działa zapis danych</Link>
            </div>
          </div>
          <div className="rounded-[20px] border border-[#234035] bg-[#13261F] p-5">
            {demoRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 border-b border-[#20382E] py-3 text-sm last:border-b-0">
                <span className="text-[#CFE0D8]">{row.label}</span>
                <span className={`rounded-full px-3 py-1 font-mono text-xs font-bold ${toneStyles[row.tone as keyof typeof toneStyles]}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
