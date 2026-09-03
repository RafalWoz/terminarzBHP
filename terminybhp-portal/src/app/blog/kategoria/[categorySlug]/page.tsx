import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCategories, getCategoryBySlug, getPostsByCategorySlug } from "@/lib/content";
import { canonicalUrl, siteUrl } from "@/lib/seo";

type CategoryPageProps = { params: Promise<{ categorySlug: string }> };

function postUrl(slug: string) {
  return `/blog/${slug}/`;
}

function categoryUrl(categorySlug: string) {
  return `/blog/kategoria/${categorySlug}/`;
}

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ categorySlug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = getCategoryBySlug((await params).categorySlug);
  if (!category) return {};

  return {
    title: `${category.name} - artykuły BHP | TerminyBHP`,
    description: `Archiwum kategorii ${category.name} w blogu TerminyBHP. Praktyczne instrukcje, terminy i dokumenty BHP w jednym miejscu.`,
    alternates: { canonical: canonicalUrl(categoryUrl(category.slug)) },
    openGraph: {
      title: `${category.name} - artykuły BHP`,
      description: `Archiwum kategorii ${category.name} w blogu TerminyBHP.`,
      url: canonicalUrl(categoryUrl(category.slug)),
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug((await params).categorySlug);
  if (!category) notFound();

  const posts = getPostsByCategorySlug(category.slug);
  const pageUrl = canonicalUrl(categoryUrl(category.slug));
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog/` },
      { "@type": "ListItem", position: 3, name: category.name, item: pageUrl },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <section className="border-b border-[var(--slate-200)] bg-[linear-gradient(180deg,#fff,var(--paper))] px-5 py-14 sm:px-6 lg:py-18">
        <div className="mx-auto max-w-[1160px]">
          <nav aria-label="Okruszki" className="text-sm font-semibold text-[var(--slate-700)]">
            <Link href="/" className="hover:text-[var(--teal-700)]">Strona główna</Link>
            <span aria-hidden="true"> / </span>
            <Link href="/blog/" className="hover:text-[var(--teal-700)]">Blog</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-[var(--navy-950)]">{category.name}</span>
          </nav>
          <p className="mt-8 font-mono text-xs font-bold uppercase tracking-[0.1em] text-[var(--teal-700)]">Kategoria</p>
          <h1 className="mt-4 text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[var(--navy-950)] sm:text-6xl">{category.name}</h1>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-[var(--slate-700)]">
            Wszystkie wpisy z kategorii {category.name}. Łącznie: {category.count}.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="flex flex-col rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_30px_-22px_rgba(19,33,28,0.4)]">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--slate-600)]">{post.readingTime}</p>
              <h2 className="mt-3 text-xl font-black leading-tight tracking-[-0.03em] text-[var(--navy-950)]">{post.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-[var(--slate-700)]">{post.description}</p>
              <Link href={postUrl(post.slug)} className="mt-5 inline-flex font-bold text-[var(--teal-700)] hover:text-[var(--navy-950)]">
                Czytaj artykuł →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
