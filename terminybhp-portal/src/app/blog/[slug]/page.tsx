/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { DownloadLink } from "@/components/DownloadLink";
import { getAffiliateRecommendation } from "@/lib/affiliateLinks";
import {
  getAllPostSlugs,
  getCategorySlug,
  getPost,
  getPostModifiedDate,
  getRelatedPosts,
  hasVisiblePostUpdateDate,
  type BlogPost,
} from "@/lib/content";
import { prepareArticleHtml, type TableOfContentsItem } from "@/lib/blogStructure";
import { canonicalUrl, siteUrl } from "@/lib/seo";

type BlogPostPageProps = { params: Promise<{ slug: string }> };

const editorialAuthor = "Redakcja TerminyBHP";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

function postUrl(slug: string) {
  return `/blog/${slug}/`;
}

function categoryUrl(category: string) {
  return `/blog/kategoria/${getCategorySlug(category)}/`;
}

function ArticleContent({ content, preparedHtml }: { content: string[]; preparedHtml?: string }) {
  if (preparedHtml) {
    return <div className="article-content text-lg leading-8 text-[var(--slate-700)]" dangerouslySetInnerHTML={{ __html: preparedHtml }} />;
  }
  return <div className="article-content text-lg leading-8 text-[var(--slate-700)]">{content.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}

function TableOfContentsLinks({ items }: { items: TableOfContentsItem[] }) {
  return (
    <ol className="mt-4 space-y-2 text-sm font-semibold leading-6 text-[var(--slate-700)]">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className="block rounded-[12px] px-3 py-2 hover:bg-[var(--paper)] hover:text-[var(--teal-700)]">
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

function MobileTableOfContents({ items }: { items: TableOfContentsItem[] }) {
  if (items.length < 3) return null;

  return (
    <details className="mt-6 rounded-[20px] border border-[var(--slate-200)] bg-white p-4 shadow-[0_8px_24px_rgba(7,24,38,0.05)] lg:hidden">
      <summary className="cursor-pointer font-black text-[var(--navy-950)]">W tym artykule</summary>
      <TableOfContentsLinks items={items} />
    </details>
  );
}

function DesktopTableOfContents({ items }: { items: TableOfContentsItem[] }) {
  if (items.length < 3) return null;

  return (
    <nav aria-label="Spis treści" className="hidden rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)] lg:block">
      <p className="font-black text-[var(--navy-950)]">W tym artykule</p>
      <TableOfContentsLinks items={items} />
    </nav>
  );
}

function DownloadCta({ post }: { post: BlogPost }) {
  if (!post.downloadFile) return null;

  return (
    <div className="mt-6 rounded-[22px] border border-[#bfe0d0] bg-[#F1F8F3] p-5 shadow-[0_8px_24px_rgba(7,24,38,0.04)]">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--teal-700)]">Materiał do pobrania</p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold leading-6 text-[var(--slate-700)]">
          {post.downloadNote || "Pobierz materiał uzupełniający do tego wpisu."}
        </p>
        <DownloadLink href={post.downloadFile} label={post.downloadLabel || "Pobierz plik"} postSlug={post.slug} />
      </div>
    </div>
  );
}

function AffiliateRecommendation({ slug }: { slug: string }) {
  const affiliate = getAffiliateRecommendation(slug);
  if (!affiliate) return null;

  return <aside aria-label="Polecany materiał" className="mt-8 rounded-[24px] border border-[#bfe0d0] bg-[#F1F8F3] p-5 shadow-[0_8px_24px_rgba(7,24,38,0.04)] sm:p-6">
    <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--teal-700)]">Polecane po lekturze · link afiliacyjny</p>
    <h2 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em] text-[var(--navy-950)]">{affiliate.title}</h2>
    <p className="mt-3 text-base leading-7 text-[var(--slate-700)]">{affiliate.description}</p>
    <a href={affiliate.href} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-5 inline-flex rounded-[14px] bg-[var(--teal-600)] px-5 py-3 text-sm font-extrabold text-white hover:bg-[var(--teal-700)]">{affiliate.cta}</a>
  </aside>;
}

function RelatedArticles({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="rounded-[24px] border border-[var(--slate-200)] bg-white p-5 shadow-[0_8px_24px_rgba(7,24,38,0.05)]">
      <p className="font-black text-[var(--navy-950)]">Przeczytaj też</p>
      <div className="mt-4 space-y-4">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-[var(--slate-200)] pb-4 last:border-b-0 last:pb-0">
            <Link href={postUrl(post.slug)} className="font-extrabold leading-snug text-[var(--navy-950)] hover:text-[var(--teal-700)]">
              {post.title}
            </Link>
            <p className="mt-2 text-sm leading-6 text-[var(--slate-700)]">{post.description}</p>
            <Link href={postUrl(post.slug)} className="mt-2 inline-flex text-sm font-extrabold text-[var(--teal-700)] hover:text-[var(--navy-950)]">
              Czytaj artykuł
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = getPost((await params).slug);
  if (!post) return {};
  const articleUrl = canonicalUrl(`/blog/${post.slug}/`);
  const modifiedDate = getPostModifiedDate(post);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: articleUrl },
    openGraph: {
      type: "article",
      url: articleUrl,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: modifiedDate,
      images: post.ogImage ? [{ url: post.ogImage, alt: post.imageAlt || post.title }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const preparedArticle = post.contentHtml ? prepareArticleHtml(post.contentHtml) : undefined;
  const tableOfContents = preparedArticle?.tableOfContents || [];
  const faqItems = preparedArticle?.faqItems || [];
  const relatedPosts = getRelatedPosts(post);
  const articleUrl = canonicalUrl(`/blog/${post.slug}/`);
  const categoryArchiveUrl = canonicalUrl(categoryUrl(post.category));
  const modifiedDateValue = getPostModifiedDate(post);
  const showUpdatedDate = hasVisiblePostUpdateDate(post);
  const publishedDate = new Date(post.date).toLocaleDateString("pl-PL");
  const modifiedDate = new Date(modifiedDateValue).toLocaleDateString("pl-PL");
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    mainEntityOfPage: articleUrl,
    datePublished: post.date,
    dateModified: modifiedDateValue,
    inLanguage: "pl-PL",
    author: { "@type": "Organization", name: editorialAuthor, url: siteUrl },
    publisher: { "@type": "Organization", name: "TerminyBHP", url: siteUrl },
    image: post.ogImage ? [new URL(post.ogImage, siteUrl).toString()] : undefined,
  };
  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answerText,
      },
    })),
  } : null;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog/` },
      { "@type": "ListItem", position: 3, name: post.category, item: categoryArchiveUrl },
      { "@type": "ListItem", position: 4, name: post.title, item: articleUrl },
    ],
  };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c") }} />
    {faqSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} /> : null}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    <section className="border-b border-[var(--slate-200)] bg-[linear-gradient(180deg,#fff,var(--paper))]">
      <div className="mx-auto grid max-w-[1160px] gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:items-start lg:py-16">
        <article>
          <nav aria-label="Okruszki" className="text-sm font-semibold text-[var(--slate-700)]">
            <Link href="/" className="hover:text-[var(--teal-700)]">Strona główna</Link><span aria-hidden="true"> / </span><Link href="/blog/" className="hover:text-[var(--teal-700)]">Blog</Link><span aria-hidden="true"> / </span><Link href={categoryUrl(post.category)} className="hover:text-[var(--teal-700)]">{post.category}</Link><span aria-hidden="true"> / </span><span aria-current="page" className="text-[var(--navy-950)]">{post.title}</span>
          </nav>
          <div className="mt-8 inline-flex rounded-full bg-[var(--green-50)] px-3 py-1.5 text-xs font-extrabold text-[var(--teal-700)]">{post.category} · {post.readingTime} · {publishedDate}</div>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[var(--navy-950)] sm:text-6xl">{post.title}</h1>
          <p className="mt-6 max-w-3xl text-xl leading-8 text-[var(--slate-700)]">{post.description}</p>
          <DownloadCta post={post} />
          <p className="mt-4 text-sm font-semibold text-[var(--slate-700)]">Autor: {editorialAuthor} · Publikacja: {publishedDate}{showUpdatedDate ? ` · Aktualizacja: ${modifiedDate}` : ""}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/serwis/" className="inline-flex justify-center rounded-[14px] border border-[var(--slate-200)] bg-white px-5 py-3 text-sm font-extrabold text-[var(--navy-900)] hover:border-[var(--slate-500)]">Zobacz terminy w serwisie</Link>
          </div>
          <MobileTableOfContents items={tableOfContents} />
          {post.coverImage ? <figure className="mt-8 max-w-4xl overflow-hidden rounded-[24px] border border-[var(--slate-200)] bg-white shadow-[0_8px_24px_rgba(7,24,38,0.05)]"><img src={post.coverImage} alt={post.imageAlt || post.title} title={post.imageTitle} width="1200" height="675" fetchPriority="high" decoding="async" className="aspect-[16/9] w-full object-cover" /></figure> : null}
        </article>
        <DesktopTableOfContents items={tableOfContents} />
      </div>
    </section>
    <section className="mx-auto grid max-w-[1160px] gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="rounded-[28px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)] sm:p-9">
        <ArticleContent content={post.content} preparedHtml={preparedArticle?.html} />
        <AffiliateRecommendation slug={post.slug} />
      </article>
      <aside className="space-y-5">
        <div className="rounded-[20px] border border-[#f6d997] bg-[var(--amber-50)] p-5 text-[#77520b]"><p className="font-black">Kiedy to nie wystarczy?</p><p className="mt-2 text-sm leading-6">Jeśli sytuacja dotyczy wypadku, sporu, kontroli albo nietypowego stanowiska, potraktuj wpis jako punkt startu i sprawdź szczegóły w dokumentacji firmowej.</p></div>
        <RelatedArticles posts={relatedPosts} />
        <div className="rounded-[24px] bg-[var(--navy-900)] p-6 text-white shadow-[var(--shadow-soft)]"><p className="font-black">Kolejny krok</p><p className="mt-2 text-sm leading-6 text-[#b9cad8]">Uporządkuj pracowników, daty i przypomnienia w jednym rejestrze, zanim termin stanie się problemem.</p><Link href="/serwis/" className="mt-5 inline-flex rounded-[14px] bg-[var(--teal-600)] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[var(--teal-700)]">Przejdź do serwisu</Link></div>
      </aside>
    </section>
  </main>;
}
