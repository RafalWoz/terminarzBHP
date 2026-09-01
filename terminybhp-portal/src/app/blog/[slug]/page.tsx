/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPost } from "@/lib/content";
import { getAffiliateRecommendation, isAffiliateHref } from "@/lib/affiliateLinks";
import { canonicalInternalHref, canonicalUrl, siteUrl } from "@/lib/seo";

type BlogPostPageProps = { params: Promise<{ slug: string }> };

const articleChecks = ["Kiedy wykonać działanie", "Co zapisać w dokumentacji", "Kiedy potrzebna jest reakcja"];
const allowedArticleTags = new Set(["a", "blockquote", "br", "em", "h2", "h3", "h4", "li", "ol", "p", "strong", "ul"]);
const editorialAuthor = "Redakcja TerminyBHP";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isSafeArticleHref(href: string) {
  return /^https?:\/\//i.test(href) || /^\/(?!\/)/.test(href) || /^#[A-Za-z0-9_-]/.test(href);
}

function canonicalizeArticleHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return canonicalInternalHref(href);
  }

  try {
    const url = new URL(href);
    if (url.hostname === "terminybhp.pl" || url.hostname === "www.terminybhp.pl") {
      return `${canonicalUrl(url.pathname)}${url.search}${url.hash}`;
    }
  } catch {
    return href;
  }

  return href;
}

function sanitizeArticleHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form)\b[^>]*\/?\s*>/gi, "")
    .replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (tag, rawName: string, rawAttributes: string) => {
      const name = rawName.toLowerCase();
      if (!allowedArticleTags.has(name)) return "";
      if (tag.startsWith("</")) return `</${name}>`;
      if (name === "br") return "<br>";
      if (name !== "a") return `<${name}>`;
      const hrefMatch = rawAttributes.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const href = (hrefMatch?.[1] || hrefMatch?.[2] || "").trim();
      if (!isSafeArticleHref(href)) return "";
      const canonicalHref = canonicalizeArticleHref(href);
      const safeHref = escapeHtmlAttribute(canonicalHref);
      if (/^https?:\/\//i.test(href)) {
        const rel = isAffiliateHref(href) ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer";
        return `<a href="${safeHref}" target="_blank" rel="${rel}">`;
      }
      return `<a href="${safeHref}">`;
    });
}

function ArticleContent({ content, contentHtml }: { content: string[]; contentHtml?: string }) {
  if (contentHtml) {
    return <div className="article-content text-lg leading-8 text-[var(--slate-700)]" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(contentHtml) }} />;
  }
  return <div className="article-content text-lg leading-8 text-[var(--slate-700)]">{content.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
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

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = getPost((await params).slug);
  if (!post) return {};
  const articleUrl = canonicalUrl(`/blog/${post.slug}/`);
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
      modifiedTime: post.publishedAt || post.date,
      images: post.ogImage ? [{ url: post.ogImage, alt: post.imageAlt || post.title }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const articleUrl = canonicalUrl(`/blog/${post.slug}/`);
  const publishedDate = new Date(post.date).toLocaleDateString("pl-PL");
  const modifiedDate = new Date(post.publishedAt || post.date).toLocaleDateString("pl-PL");
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    mainEntityOfPage: articleUrl,
    datePublished: post.date,
    dateModified: post.publishedAt || post.date,
    inLanguage: "pl-PL",
    author: { "@type": "Organization", name: editorialAuthor, url: siteUrl },
    publisher: { "@type": "Organization", name: "TerminyBHP", url: siteUrl },
    image: post.ogImage ? [new URL(post.ogImage, siteUrl).toString()] : undefined,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog/` },
      { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
    ],
  };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    <section className="border-b border-[var(--slate-200)] bg-[linear-gradient(180deg,#fff,var(--paper))]">
      <div className="mx-auto grid max-w-[1160px] gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:items-start lg:py-16">
        <article>
          <nav aria-label="Okruszki" className="text-sm font-semibold text-[var(--slate-700)]">
            <Link href="/" className="hover:text-[var(--teal-700)]">Strona główna</Link><span aria-hidden="true"> / </span><Link href="/blog/" className="hover:text-[var(--teal-700)]">Blog</Link>
          </nav>
          <div className="mt-8 inline-flex rounded-full bg-[var(--green-50)] px-3 py-1.5 text-xs font-extrabold text-[var(--teal-700)]">{post.category} · {post.readingTime} · {publishedDate}</div>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[var(--navy-950)] sm:text-6xl">{post.title}</h1>
          <p className="mt-6 max-w-3xl text-xl leading-8 text-[var(--slate-700)]">{post.description}</p>
          <p className="mt-4 text-sm font-semibold text-[var(--slate-700)]">Autor: {editorialAuthor} · Publikacja: {publishedDate} · Aktualizacja: {modifiedDate}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/templates/" className="inline-flex justify-center rounded-[14px] bg-[var(--teal-600)] px-5 py-3 text-sm font-extrabold text-white hover:bg-[var(--teal-700)]">Sprawdź szablony</Link>
            <Link href="/serwis/" className="inline-flex justify-center rounded-[14px] border border-[var(--slate-200)] bg-white px-5 py-3 text-sm font-extrabold text-[var(--navy-900)] hover:border-[var(--slate-500)]">Zobacz terminy w serwisie</Link>
          </div>
          {post.coverImage ? <figure className="mt-8 max-w-4xl overflow-hidden rounded-[24px] border border-[var(--slate-200)] bg-white shadow-[0_8px_24px_rgba(7,24,38,0.05)]"><img src={post.coverImage} alt={post.imageAlt || post.title} title={post.imageTitle} width="1200" height="675" fetchPriority="high" decoding="async" className="aspect-[16/9] w-full object-cover" /></figure> : null}
        </article>
        <aside className="rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)]">
          <p className="font-black text-[var(--navy-950)]">W tym artykule</p>
          <ul className="mt-4 divide-y divide-[var(--slate-200)] text-sm text-[var(--slate-700)]">{articleChecks.map((check) => <li key={check} className="py-3"><span className="mr-2 font-black text-[var(--teal-700)]">✓</span>{check}</li>)}</ul>
        </aside>
      </div>
    </section>
    <section className="mx-auto grid max-w-[1160px] gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="rounded-[28px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)] sm:p-9">
        <ArticleContent content={post.content} contentHtml={post.contentHtml} />
        <AffiliateRecommendation slug={post.slug} />
      </article>
      <aside className="space-y-5">
        <div className="rounded-[20px] border border-[#f6d997] bg-[var(--amber-50)] p-5 text-[#77520b]"><p className="font-black">Kiedy to nie wystarczy?</p><p className="mt-2 text-sm leading-6">Jeśli sytuacja dotyczy wypadku, sporu, kontroli albo nietypowego stanowiska, potraktuj wpis jako punkt startu i sprawdź szczegóły w dokumentacji firmowej.</p></div>
        <div className="rounded-[24px] bg-[var(--navy-900)] p-6 text-white shadow-[var(--shadow-soft)]"><p className="font-black">Kolejny krok</p><p className="mt-2 text-sm leading-6 text-[#b9cad8]">Uporządkuj pracowników, daty i przypomnienia w jednym rejestrze, zanim termin stanie się problemem.</p><Link href="/serwis/" className="mt-5 inline-flex rounded-[14px] bg-[var(--teal-600)] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[var(--teal-700)]">Przejdź do serwisu</Link></div>
      </aside>
    </section>
  </main>;
}
