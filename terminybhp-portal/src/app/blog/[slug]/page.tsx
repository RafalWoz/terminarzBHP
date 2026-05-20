import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/content";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const articleChecks = [
  "Kiedy wykonać działanie",
  "Co zapisać w dokumentacji",
  "Kiedy potrzebna jest reakcja",
];

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main>
      <section className="border-b border-[var(--slate-200)] bg-[linear-gradient(180deg,#fff,var(--paper))]">
        <div className="mx-auto grid max-w-[1160px] gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:items-start lg:py-16">
          <article>
            <Link href="/blog" className="text-sm font-extrabold text-[var(--teal-700)] hover:text-[var(--navy-950)]">
              Wróć do bloga
            </Link>
            <div className="mt-8 inline-flex rounded-full bg-[var(--green-50)] px-3 py-1.5 text-xs font-extrabold text-[var(--teal-700)]">
              {post.category} · {post.readingTime} · {new Date(post.date).toLocaleDateString("pl-PL")}
            </div>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[var(--navy-950)] sm:text-6xl">
              {post.title}
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-[var(--slate-700)]">{post.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/templates" className="inline-flex justify-center rounded-[14px] bg-[var(--teal-600)] px-5 py-3 text-sm font-extrabold text-white hover:bg-[var(--teal-700)]">
                Sprawdź szablony
              </Link>
              <Link href="/serwis/" className="inline-flex justify-center rounded-[14px] border border-[var(--slate-200)] bg-white px-5 py-3 text-sm font-extrabold text-[var(--navy-900)] hover:border-[var(--slate-500)]">
                Zobacz terminy w serwisie
              </Link>
            </div>
          </article>

          <aside className="rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)]">
            <p className="font-black text-[var(--navy-950)]">W tym artykule</p>
            <ul className="mt-4 divide-y divide-[var(--slate-200)] text-sm text-[var(--slate-700)]">
              {articleChecks.map((check) => (
                <li key={check} className="py-3">
                  <span className="mr-2 font-black text-[var(--teal-700)]">✓</span>
                  {check}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1160px] gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-[28px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)] sm:p-9">
          <div className="space-y-7 text-lg leading-8 text-[var(--slate-700)]">
            {post.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <aside className="space-y-5">
          <div className="rounded-[20px] border border-[#f6d997] bg-[var(--amber-50)] p-5 text-[#77520b]">
            <p className="font-black">Kiedy to nie wystarczy?</p>
            <p className="mt-2 text-sm leading-6">
              Jeśli sytuacja dotyczy wypadku, sporu, kontroli albo nietypowego stanowiska, potraktuj wpis jako punkt startu i sprawdź szczegóły w dokumentacji firmowej.
            </p>
          </div>
          <div className="rounded-[24px] bg-[var(--navy-900)] p-6 text-white shadow-[var(--shadow-soft)]">
            <p className="font-black">Kolejny krok</p>
            <p className="mt-2 text-sm leading-6 text-[#b9cad8]">
              Uporządkuj pracowników, daty i przypomnienia w jednym rejestrze, zanim termin stanie się problemem.
            </p>
            <Link href="/serwis/" className="mt-5 inline-flex rounded-[14px] bg-[var(--teal-600)] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[var(--teal-700)]">
              Przejdź do serwisu
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
