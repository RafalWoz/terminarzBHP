import { isAffiliateHref } from "@/lib/affiliateLinks";
import { canonicalInternalHref, canonicalUrl } from "@/lib/seo";
import { slugifyText } from "@/lib/slug";

export type TableOfContentsItem = {
  id: string;
  title: string;
};

export type FaqItem = {
  question: string;
  answerHtml: string;
  answerText: string;
};

export type PreparedArticleHtml = {
  html: string;
  tableOfContents: TableOfContentsItem[];
  faqItems: FaqItem[];
};

const allowedArticleTags = new Set(["a", "blockquote", "br", "em", "h2", "h3", "h4", "li", "ol", "p", "strong", "ul"]);

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)));
}

function textFromHtml(html: string) {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
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

function addHeadingIds(html: string) {
  const usedIds = new Map<string, number>();
  const tableOfContents: TableOfContentsItem[] = [];

  const htmlWithIds = html.replace(/<h2>([\s\S]*?)<\/h2>/gi, (_, innerHtml: string) => {
    const title = textFromHtml(innerHtml);
    const baseId = slugifyText(title);
    const currentCount = usedIds.get(baseId) || 0;
    const nextCount = currentCount + 1;
    usedIds.set(baseId, nextCount);
    const id = nextCount === 1 ? baseId : `${baseId}-${nextCount}`;

    tableOfContents.push({ id, title });
    return `<h2 id="${escapeHtmlAttribute(id)}">${innerHtml}</h2>`;
  });

  return { html: htmlWithIds, tableOfContents };
}

function findFaqSection(html: string) {
  const headings = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
  const faqIndex = headings.findIndex((heading) => textFromHtml(heading[1]).toLowerCase() === "faq");
  if (faqIndex === -1) return "";

  const faqHeading = headings[faqIndex];
  const sectionStart = (faqHeading.index || 0) + faqHeading[0].length;
  const nextHeading = headings[faqIndex + 1];
  const sectionEnd = nextHeading?.index ?? html.length;
  return html.slice(sectionStart, sectionEnd);
}

function extractFaqFromHeadings(sectionHtml: string) {
  const headings = [...sectionHtml.matchAll(/<h3>([\s\S]*?)<\/h3>/gi)];
  return headings.map((heading, index) => {
    const question = textFromHtml(heading[1]);
    const answerStart = (heading.index || 0) + heading[0].length;
    const answerEnd = headings[index + 1]?.index ?? sectionHtml.length;
    const answerHtml = trimTrailingEditorialNote(sectionHtml.slice(answerStart, answerEnd).trim());
    const answerText = textFromHtml(answerHtml);
    return { question, answerHtml, answerText };
  }).filter((item) => item.question && item.answerText);
}

function extractFaqFromList(sectionHtml: string) {
  return [...sectionHtml.matchAll(/<li>\s*<strong>([\s\S]*?)<\/strong>([\s\S]*?)<\/li>/gi)]
    .map((item) => {
      const question = textFromHtml(item[1]);
      const answerHtml = trimTrailingEditorialNote(item[2].replace(/^(\s*<br>\s*)+/i, "").trim());
      const answerText = textFromHtml(answerHtml);
      return { question, answerHtml, answerText };
    })
    .filter((item) => item.question && item.answerText);
}

function trimTrailingEditorialNote(answerHtml: string) {
  return answerHtml
    .replace(/<p>\s*(?:Artykuł|Materiał|Tekst)\s+ma\s+charakter\s+informacyjny[\s\S]*$/i, "")
    .replace(/<p>\s*Informacje\s+mają\s+charakter\s+(?:praktyczny\s+i\s+)?informacyjny[\s\S]*$/i, "")
    .trim();
}

function extractFaqItems(html: string) {
  const sectionHtml = findFaqSection(html);
  if (!sectionHtml) return [];
  const headingItems = extractFaqFromHeadings(sectionHtml);
  return headingItems.length > 0 ? headingItems : extractFaqFromList(sectionHtml);
}

export function prepareArticleHtml(html: string): PreparedArticleHtml {
  const sanitizedHtml = sanitizeArticleHtml(html);
  const article = addHeadingIds(sanitizedHtml);

  return {
    html: article.html,
    tableOfContents: article.tableOfContents,
    faqItems: extractFaqItems(article.html),
  };
}
