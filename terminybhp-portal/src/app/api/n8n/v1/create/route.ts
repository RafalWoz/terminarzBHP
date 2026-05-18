import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type IncomingPost = {
  title?: string;
  slug?: string;
  description?: string;
  excerpt?: string;
  category?: string;
  content?: string | string[];
  status?: "publish" | "draft";
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function normalizeContent(content: IncomingPost["content"]) {
  if (Array.isArray(content)) {
    return content.map((paragraph) => paragraph.trim()).filter(Boolean);
  }

  if (typeof content !== "string") {
    return [];
  }

  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function POST(req: NextRequest) {
  try {
    const expectedToken = process.env.N8N_API_TOKEN;

    if (!expectedToken) {
      return NextResponse.json({ error: "N8N_API_TOKEN is not configured" }, { status: 503 });
    }

    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as IncomingPost;
    const content = normalizeContent(body.content);
    const title = body.title?.trim();
    const slug = slugify(body.slug || body.title || "");

    if (!title || !slug || content.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug/title, or content" },
        { status: 400 }
      );
    }

    const postData = {
      title,
      slug,
      description: body.description || body.excerpt || content[0].slice(0, 180),
      category: body.category || "BHP",
      content,
      status: body.status === "draft" ? "draft" : "publish",
      createdAt: new Date().toISOString(),
    };

    const postsDir = path.join(process.cwd(), "data", "posts");
    fs.mkdirSync(postsDir, { recursive: true });
    fs.writeFileSync(path.join(postsDir, `${slug}.json`), JSON.stringify(postData, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      slug,
      url: `/blog/${slug}`,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
