/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPost } from "@/lib/content";

type BlogPostPageProps = { params: Promise<{ slug: string }> };
type ArticleBlock =
  | { type: "summary"; text: string }
  | { type: "heading"; text: string }
  | { type: "question"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const articleChecks = ["Kiedy wykonać działanie", "Co zapisać w dokumentacji", "Kiedy potrzebna jest reakcja"];
const allowedArticleTags = new Set(["a", "blockquote", "br", "em", "h2", "h3", "h4", "li", "ol", "p", "strong", "ul"]);
const sectionHeadings = new Set([
  "Hierarchia aktów prawa pracy w zakresie BHP",
  "Wybrane artykuły Kodeksu pracy odnoszące się do BHP",
  "Najważniejsze rozporządzenia wykonawcze",
  "Zakres regulacji według obszarów praktycznych",
  "Kto nadzoruje i kto wspiera wdrożenie przepisów BHP",
  "Wpływ prawa unijnego na krajowe regulacje BHP",
  "Rejestry, terminy i przechowywanie dokumentów",
  "Checklist — co sprawdzić i kiedy działać",
]);
const sourceLinks = [
  { label: "Kodeks pracy (skonsolidowany) - ISAP", href: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20230001465" },
  { label: "Kodeks pracy - ISAP", href: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20230001465" },
  { label: "Kodeks pracy (ISAP)", href: "https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU19740240141/U/D19740141Lj.pdf" },
  { label: "Nowelizacja rozporządzenia szkoleniowego - ISAP", href: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250001640" },
  { label: "Obwieszczenie dotyczące stanowisk z monitorami - ISAP", href: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250000058" },
  { label: "Rozporządzenia medyczne - ISAP", href: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20230000607" },
  { label: "Rozporządzenie w sprawie ogólnych przepisów BHP (ISAP)", href: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19971290844" },
  { label: "rozporządzenie o badaniach lekarskich (ISAP)", href: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20230000607" },
  { label: "Państwowa Inspekcja Pracy - cele i zadania", href: "https://pip.gov.pl/o-nas/cele-i-zadania" },
  { label: "Jak zgłosić wypadek? - PIP", href: "https://www.pip.gov.pl/dla-pracodawcow/niezbednik-pracodawcy/jak-zglosic-wypadek" },
  { label: "Ocena ryzyka zawodowego (PIP)", href: "https://www.pip.gov.pl/dla-pracodawcow/niezbednik-pracodawcy/ocena-ryzyka-zawodowego" },
  { label: "listy kontrolne i materiały CIOP‑PIB", href: "https://www.ciop.pl/CIOPPortalWAR/appmanager/ciop/pl?_nfpb=true&_pageLabel=P15800279791347637261333" },
  { label: "Szkolenia BHP (PIP)", href: "https://www.pip.gov.pl/dla-pracodawcow/porady-prawne/szkolenia-w-dziedzinie-bezpieczenstwa-i-higieny-pracy" },
  { label: "Choroby zawodowe (PIP)", href: "https://www.pip.gov.pl/dla-pracodawcow/porady-prawne/choroby-zawodowe" },
  { label: "informacje o pracy zdalnej (Gov.pl)", href: "https://www.gov.pl/web/family/remote-work" },
  { label: "Jak przygotować się do kontroli (PIP)", href: "https://www.pip.gov.pl/en/for-employers/how-to-prepare-for-an-inspection" },
  { label: "Rozporządzenie UE ws. środków ochrony indywidualnej - Gov.pl", href: "https://www.gov.pl/web/rozwoj-technologia/dyrektywa-i-rozporzadzenie-ue-ws-srodkow-ochrony-indywidualnej" },
];

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

function sanitizeArticleHtml(html: string) {
  return html
    .replace(/<!--([\s\S]*?)-->/g, "")
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
      if (!/^https?:\/\//i.test(href)) return "";
      const safeHref = href.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">`;
    });
}

function isQuestionHeading(line: string) {
  return line.endsWith("?") && line.length <= 140;
}
function isSectionHeading(line: string) {
  if (sectionHeadings.has(line) || line === "FAQ") return true;
  if (line === "Co sprawdzić i kiedy działać:") return false;
  return line.length <= 100 && !/[.!?:]$/.test(line);
}
function buildArticleBlocks(content: string[]) {
  const blocks: ArticleBlock[] = [];
  let listItems: string[] = [];
  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  };
  for (const chunk of content) {
    for (const line of chunk.split("\n").map((item) => item.trim()).filter(Boolean)) {
      if (line.startsWith("- ")) {
        listItems.push(line.slice(2).trim());
        continue;
      }
      flushList();
      if (line === "W skrócie") blocks.push({ type: "summary", text: line });
      else if (isQuestionHeading(line)) blocks.push({ type: "question", text: line });
      else if (isSectionHeading(line)) blocks.push({ type: "heading", text: line });
      else blocks.push({ type: "paragraph", text: line });
    }
  }
  flushList();
  return blocks;
}
function renderLinkedText(text: string) {
  const links = [...sourceLinks].sort((a, b) => b.label.length - a.label.length);
  const nodes = [];
  let rest = text;
  let key = 0;
  while (rest.length > 0) {
    const match = links.map((link) => ({ link, index: rest.indexOf(link.label) })).filter((item) => item.index >= 0).sort((a, b) => a.index - b.index)[0];
    if (!match) {
      nodes.push(rest);
      break;
    }
    if (match.index > 0) nodes.push(rest.slice(0, match.index));
    nodes.push(<a key={`${match.link.href}-${key}`} href={match.link.href} target="_blank" rel="noopener noreferrer">{match.link.label}</a>);
    rest = rest.slice(match.index + match.link.label.length);
    key += 1;
  }
  return nodes;
}
function ArticleContent({ content, contentHtml }: { content: string[]; contentHtml?: string }) {
  if (contentHtml) {
    return <div className="article-content text-lg leading-8 text-[var(--slate-700)]" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(contentHtml) }} />;
  }
  const blocks = buildArticleBlocks(content);
  return <div className="article-content text-lg leading-8 text-[var(--slate-700)]">{blocks.map((block, index) => {
    if (block.type === "summary") return <p key={`${block.type}-${index}`} className="text-base font-black uppercase tracking-[0.08em] text-[var(--teal-700)]">{block.text}</p>;
    if (block.type === "heading") return <h2 key={`${block.type}-${index}`}>{block.text}</h2>;
    if (block.type === "question") return <h3 key={`${block.type}-${index}`}>{block.text}</h3>;
    if (block.type === "list") return <ul key={`${block.type}-${index}`}>{block.items.map((item) => <li key={item}>{renderLinkedText(item)}</li>)}</ul>;
    return <p key={`${block.type}-${index}`}>{renderLinkedText(block.text)}</p>;
  })}</div>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = getPost((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.description, openGraph: { title: post.title, description: post.description, images: post.ogImage ? [{ url: post.ogImage, alt: post.imageAlt || post.title }] : undefined } };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return <main>
    <section className="border-b border-[var(--slate-200)] bg-[linear-gradient(180deg,#fff,var(--paper))]"><div className="mx-auto grid max-w-[1160px] gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:items-start lg:py-16">
      <article><Link href="/blog" className="text-sm font-extrabold text-[var(--teal-700)] hover:text-[var(--navy-950)]">Wróć do bloga</Link><div className="mt-8 inline-flex rounded-full bg-[var(--green-50)] px-3 py-1.5 text-xs font-extrabold text-[var(--teal-700)]">{post.category} · {post.readingTime} · {new Date(post.date).toLocaleDateString("pl-PL")}</div><h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[var(--navy-950)] sm:text-6xl">{post.title}</h1><p className="mt-6 max-w-3xl text-xl leading-8 text-[var(--slate-700)]">{post.description}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/templates" className="inline-flex justify-center rounded-[14px] bg-[var(--teal-600)] px-5 py-3 text-sm font-extrabold text-white hover:bg-[var(--teal-700)]">Sprawdź szablony</Link><Link href="/serwis/" className="inline-flex justify-center rounded-[14px] border border-[var(--slate-200)] bg-white px-5 py-3 text-sm font-extrabold text-[var(--navy-900)] hover:border-[var(--slate-500)]">Zobacz terminy w serwisie</Link></div>{post.coverImage ? <figure className="mt-8 max-w-4xl overflow-hidden rounded-[24px] border border-[var(--slate-200)] bg-white shadow-[0_8px_24px_rgba(7,24,38,0.05)]"><img src={post.coverImage} alt={post.imageAlt || post.title} title={post.imageTitle} className="aspect-[16/9] w-full object-cover" /></figure> : null}</article>
      <aside className="rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)]"><p className="font-black text-[var(--navy-950)]">W tym artykule</p><ul className="mt-4 divide-y divide-[var(--slate-200)] text-sm text-[var(--slate-700)]">{articleChecks.map((check) => <li key={check} className="py-3"><span className="mr-2 font-black text-[var(--teal-700)]">✓</span>{check}</li>)}</ul></aside>
    </div></section>
    <section className="mx-auto grid max-w-[1160px] gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]"><article className="rounded-[28px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)] sm:p-9"><ArticleContent content={post.content} contentHtml={post.contentHtml} /></article><aside className="space-y-5"><div className="rounded-[20px] border border-[#f6d997] bg-[var(--amber-50)] p-5 text-[#77520b]"><p className="font-black">Kiedy to nie wystarczy?</p><p className="mt-2 text-sm leading-6">Jeśli sytuacja dotyczy wypadku, sporu, kontroli albo nietypowego stanowiska, potraktuj wpis jako punkt startu i sprawdź szczegóły w dokumentacji firmowej.</p></div><div className="rounded-[24px] bg-[var(--navy-900)] p-6 text-white shadow-[var(--shadow-soft)]"><p className="font-black">Kolejny krok</p><p className="mt-2 text-sm leading-6 text-[#b9cad8]">Uporządkuj pracowników, daty i przypomnienia w jednym rejestrze, zanim termin stanie się problemem.</p><Link href="/serwis/" className="mt-5 inline-flex rounded-[14px] bg-[var(--teal-600)] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[var(--teal-700)]">Przejdź do serwisu</Link></div></aside></section>
  </main>;
}
