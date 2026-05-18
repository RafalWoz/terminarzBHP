import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/content";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

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
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/blog" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
        Wróć do bloga
      </Link>
      <article className="mt-8">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="font-semibold text-blue-700">{post.category}</span>
          <span>{new Date(post.date).toLocaleDateString("pl-PL")}</span>
          <span>{post.readingTime}</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">{post.title}</h1>
        <p className="mt-5 text-xl leading-8 text-slate-600">{post.description}</p>
        <div className="mt-10 space-y-6 text-lg leading-8 text-slate-700">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
