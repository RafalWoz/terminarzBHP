import fs from "fs";
import path from "path";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  publishedAt?: string;
  readingTime: string;
  content: string[];
  contentHtml?: string;
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
  excerpt?: string;
  content?: string | string[];
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
    readingTime: rawPost.readingTime || estimateReadingTime(content),
    status: rawPost.status === "draft" ? "draft" : "publish",
    content,
    contentHtml: normalizeContentHtml(rawPost.contentHtml),
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
