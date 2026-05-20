import Link from "next/link";
import { getAllPosts } from "@/lib/content";

export const metadata = {
  title: "Blog BHP",
  description: "Publiczna baza wiedzy TerminyBHP: szkolenia, badania, uprawnienia i organizacja terminów BHP.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featuredPost = posts[0];

  return (
    <main>
      <section className="border-b border-[var(--slate-200)] bg-[linear-gradient(180deg,#fff,var(--paper))]">
        <div className="mx-auto grid max-w-[1160px] gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--slate-200)] bg-white px-3 py-2 text-sm font-extrabold text-[var(--teal-700)]">
              <span className="size-2 rounded-full bg-[var(--teal-600)]" />
              Baza wiedzy TerminyBHP
            </span>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.96] tracking-[-0.06em] text-[var(--navy-950)] sm:text-6xl lg:text-7xl">
              Spokojnie uporządkuj terminy, dokumenty i decyzje BHP.
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-[var(--slate-700)]">
              Artykuły dla osób, które chcą wiedzieć, co sprawdzić, kiedy działać i jaki kolejny krok wykonać bez szukania po kilku źródłach.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="inline-flex justify-center rounded-[14px] bg-[var(--teal-600)] px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(14,145,139,0.22)] hover:bg-[var(--teal-700)]"
              >
                Czytaj najnowszy wpis
              </Link>
              <Link
                href="/serwis/"
                className="inline-flex justify-center rounded-[14px] border border-[var(--slate-200)] bg-white px-5 py-3 text-sm font-extrabold text-[var(--navy-900)] hover:border-[var(--slate-500)]"
              >
                Zobacz terminy w serwisie
              </Link>
            </div>
          </div>

          <aside className="rounded-[28px] bg-[var(--navy-900)] p-7 text-white shadow-[var(--shadow-soft)]">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#b9cad8]">W blogu znajdziesz</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {["kiedy wykonać szkolenie", "jak pilnować badań", "co zapisać w dokumentacji", "kiedy przejść do serwisu"].map((item) => (
                <div key={item}>
                  <p className="text-xs uppercase tracking-[0.08em] text-[#b9cad8]">Decyzja</p>
                  <p className="mt-1 font-extrabold">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 py-14 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--teal-700)]">Wpisy</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--navy-950)]">Praktyczne instrukcje BHP</h2>
          </div>
          <p className="max-w-xl text-[var(--slate-700)]">
            Każdy wpis ma prowadzić do konkretnego działania: sprawdzić termin, przygotować dokument albo uporządkować rejestr.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="overflow-hidden rounded-[24px] border border-[var(--slate-200)] bg-white shadow-[0_8px_24px_rgba(7,24,38,0.05)]">
              <div className="relative h-36 bg-[linear-gradient(135deg,var(--navy-900),var(--teal-600))]">
                <div className="absolute inset-5 rounded-[18px] border-2 border-white/40" />
                <div className="absolute bottom-4 left-4 inline-flex rounded-full bg-[var(--green-50)] px-3 py-1.5 text-xs font-extrabold text-[var(--teal-700)]">
                  {post.category} · {post.readingTime}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black leading-tight tracking-[-0.03em] text-[var(--navy-950)]">{post.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--slate-700)]">{post.description}</p>
                <Link href={`/blog/${post.slug}`} className="mt-6 inline-flex rounded-[14px] border border-[var(--slate-200)] bg-white px-4 py-2.5 text-sm font-extrabold text-[var(--navy-900)] hover:border-[var(--slate-500)]">
                  Czytaj instrukcję
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
