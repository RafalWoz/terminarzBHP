import Link from "next/link";
import { getAllPosts } from "@/lib/content";

export const metadata = {
  title: "Blog BHP",
  description: "Publiczna baza wiedzy TerminyBHP: szkolenia, badania, uprawnienia i organizacja terminów BHP.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Blog</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Baza wiedzy BHP</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Artykuły publiczne dla osób, które chcą uporządkować szkolenia, badania, uprawnienia i inne terminy BHP.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
              <span className="font-semibold text-blue-700">{post.category}</span>
              <span>{post.readingTime}</span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-950">{post.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{post.description}</p>
            <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex text-sm font-semibold text-slate-950 hover:text-blue-700">
              Czytaj dalej
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
