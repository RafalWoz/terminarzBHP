import fs from "fs";
import path from "path";
import { slugifyText } from "@/lib/slug";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  publishedAt?: string;
  updatedAt?: string;
  readingTime: string;
  content: string[];
  contentHtml?: string;
  relatedPosts?: string[];
  downloadFile?: string;
  downloadLabel?: string;
  downloadNote?: string;
  coverImage?: string;
  ogImage?: string;
  imageAlt?: string;
  imageTitle?: string;
  imageCaption?: string;
  imageDescription?: string;
  imageFocusKeyword?: string;
  status: "publish" | "draft";
};

type RawPost = Partial<BlogPost> & {
  createdAt?: string;
  modifiedAt?: string;
  lastModified?: string;
  excerpt?: string;
  content?: string | string[];
  related_posts?: string[];
  download_file?: string;
  download_label?: string;
  download_note?: string;
};

const postsDir = path.join(process.cwd(), "data", "posts");
const postsOrderPath = path.join(process.cwd(), ".generated", "posts-order.json");

function estimateReadingTime(content: string[]) {
  const words = content.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

function normalizeContent(content: string | string[] | undefined) {
  if (Array.isArray(content)) return content.filter((paragraph) => typeof paragraph === "string" && paragraph.trim().length > 0);
  if (typeof content !== "string") return [];
  return content.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function normalizeContentHtml(contentHtml: string | undefined) {
  if (typeof contentHtml !== "string") return undefined;
  const normalizedHtml = contentHtml.replace(/\\\"/g, '"').trim();
  return normalizedHtml.length > 0 ? normalizedHtml : undefined;
}

function normalizeImagePath(imagePath: string | undefined) {
  if (typeof imagePath !== "string") return undefined;
  const trimmedPath = imagePath.trim();
  if (!trimmedPath) return undefined;
  if (/^https?:\/\//i.test(trimmedPath)) return trimmedPath;
  const normalizedPath = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
  const appPublicPath = path.join(process.cwd(), "public", normalizedPath.slice(1));
  if (normalizedPath.startsWith("/images/blog/") && !fs.existsSync(appPublicPath)) return `https://raw.githubusercontent.com/RafalWoz/terminarzBHP/main/public${normalizedPath}`;
  return normalizedPath;
}

function normalizePublicPath(filePath: string | undefined) {
  if (typeof filePath !== "string") return undefined;
  const trimmedPath = filePath.trim();
  if (!trimmedPath) return undefined;
  if (/^https?:\/\//i.test(trimmedPath)) return trimmedPath;
  return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
}

function normalizeRelatedPosts(value: string[] | undefined) {
  if (!Array.isArray(value)) return undefined;
  const slugs = [...new Set(value.map((slug) => slug.trim()).filter(Boolean))];
  return slugs.length > 0 ? slugs : undefined;
}

function readPostsOrder() {
  if (!fs.existsSync(postsOrderPath)) return {} as Record<string, string>;
  try {
    return JSON.parse(fs.readFileSync(postsOrderPath, "utf-8")) as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}

function normalizePost(rawPost: RawPost, fallbackSlug: string, publishedAt?: string): BlogPost | null {
  const content = normalizeContent(rawPost.content);
  const slug = rawPost.slug || fallbackSlug;
  const title = rawPost.title;
  if (!slug || !title || content.length === 0) return null;
  const coverImage = normalizeImagePath(rawPost.coverImage);
  const ogImage = normalizeImagePath(rawPost.ogImage || rawPost.coverImage);
  return {
    slug,
    title,
    description: rawPost.description || rawPost.excerpt || content[0].slice(0, 180),
    category: rawPost.category || "BHP",
    date: rawPost.date || rawPost.createdAt || new Date().toISOString(),
    publishedAt: rawPost.publishedAt || rawPost.createdAt || publishedAt,
    updatedAt: rawPost.updatedAt || rawPost.modifiedAt || rawPost.lastModified,
    readingTime: rawPost.readingTime || estimateReadingTime(content),
    status: rawPost.status === "draft" ? "draft" : "publish",
    content,
    contentHtml: normalizeContentHtml(rawPost.contentHtml),
    relatedPosts: normalizeRelatedPosts(rawPost.relatedPosts || rawPost.related_posts),
    downloadFile: normalizePublicPath(rawPost.downloadFile || rawPost.download_file),
    downloadLabel: rawPost.downloadLabel || rawPost.download_label,
    downloadNote: rawPost.downloadNote || rawPost.download_note,
    coverImage,
    ogImage,
    imageAlt: rawPost.imageAlt || title,
    imageTitle: rawPost.imageTitle,
    imageCaption: rawPost.imageCaption,
    imageDescription: rawPost.imageDescription,
    imageFocusKeyword: rawPost.imageFocusKeyword,
  };
}

function readPostsFromFiles() {
  if (!fs.existsSync(postsDir)) return [];
  const postsOrder = readPostsOrder();
  return fs.readdirSync(postsDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      const filePath = path.join(postsDir, fileName);
      const fallbackSlug = fileName.replace(/\.json$/, "");
      try {
        return normalizePost(JSON.parse(fs.readFileSync(filePath, "utf-8")), fallbackSlug, postsOrder[fallbackSlug]);
      } catch {
        return null;
      }
    })
    .filter((post): post is BlogPost => Boolean(post));
}

function postTimestamp(post: BlogPost) {
  return Date.parse(post.publishedAt || post.date);
}

export function getAllPosts({ includeDrafts = false } = {}) {
  return readPostsFromFiles()
    .filter((post) => includeDrafts || post.status === "publish")
    .sort((a, b) => postTimestamp(b) - postTimestamp(a));
}

export function getAllPostSlugs() {
  return getAllPosts({ includeDrafts: false }).map((post) => post.slug);
}

export function getPost(slug: string) {
  return getAllPosts({ includeDrafts: false }).find((post) => post.slug === slug);
}

function normalizedDateKey(value: string | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function getPostModifiedDate(post: BlogPost) {
  const publishedDate = normalizedDateKey(post.date);
  const updatedDate = normalizedDateKey(post.updatedAt);
  return updatedDate && updatedDate !== publishedDate && post.updatedAt ? post.updatedAt : post.date;
}

export function hasVisiblePostUpdateDate(post: BlogPost) {
  return getPostModifiedDate(post) !== post.date;
}

export function getCategorySlug(category: string) {
  return slugifyText(category, "kategoria");
}

export function getAllCategories() {
  const categories = new Map<string, { name: string; slug: string; count: number }>();

  for (const post of getAllPosts()) {
    const slug = getCategorySlug(post.category);
    const category = categories.get(slug);
    if (category) {
      category.count += 1;
    } else {
      categories.set(slug, { name: post.category, slug, count: 1 });
    }
  }

  return [...categories.values()].sort((a, b) => a.name.localeCompare(b.name, "pl"));
}

export function getCategoryBySlug(categorySlug: string) {
  return getAllCategories().find((category) => category.slug === categorySlug);
}

export function getPostsByCategorySlug(categorySlug: string) {
  return getAllPosts().filter((post) => getCategorySlug(post.category) === categorySlug);
}

export function getRelatedPosts(post: BlogPost, limit = 3) {
  const allPosts = getAllPosts();
  const postsBySlug = new Map(allPosts.map((item) => [item.slug, item]));
  const selected = new Map<string, BlogPost>();

  for (const relatedSlug of post.relatedPosts || []) {
    const relatedPost = postsBySlug.get(relatedSlug);
    if (relatedPost && relatedPost.slug !== post.slug) selected.set(relatedPost.slug, relatedPost);
    if (selected.size >= limit) return [...selected.values()];
  }

  for (const relatedPost of allPosts) {
    if (relatedPost.slug !== post.slug && relatedPost.category === post.category) {
      selected.set(relatedPost.slug, relatedPost);
    }
    if (selected.size >= limit) return [...selected.values()];
  }

  for (const relatedPost of allPosts) {
    if (relatedPost.slug !== post.slug) selected.set(relatedPost.slug, relatedPost);
    if (selected.size >= limit) return [...selected.values()];
  }

  return [...selected.values()];
}
