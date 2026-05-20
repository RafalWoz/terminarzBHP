import Link from "next/link";
import { getAllPosts, templates, tools } from "@/lib/content";

export default function Home() {
  const latestPost = getAllPosts()[0];

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
              TerminyBHP.pl
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Serwis do pilnowania terminów BHP oraz publiczna baza wiedzy dla firm.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-650">
              Jeden adres dla dwóch potrzeb: aplikacja pod /serwis/ porządkuje firmy, pracowników i terminy, a blog buduje publiczną bazę wiedzy dostępną dla każdego.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/serwis/"
                className="rounded-md bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
              >
                Przejdź do serwisu
              </Link>
              <Link
                href="/blog"
                className="rounded-md border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 hover:border-slate-500"
              >
                Czytaj blog
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-500">Układ strony</p>
            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between rounded-md bg-white px-4 py-3 shadow-sm">
                <span>terminybhp.pl/</span>
                <span className="font-medium text-slate-950">strona publiczna</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-white px-4 py-3 shadow-sm">
                <span>/blog/</span>
                <span className="font-medium text-slate-950">baza wiedzy</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-white px-4 py-3 shadow-sm">
                <span>/serwis/</span>
                <span className="font-medium text-slate-950">aplikacja</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-blue-700">Serwis</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Terminy i pracownicy</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Miejsce na prywatną aplikację dla użytkownika: firmy, pracownicy, badania, szkolenia, uprawnienia i audyty.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-blue-700">Blog</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Treści publiczne</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Artykuły pod SEO, poradniki i odpowiedzi na najczęstsze pytania związane z terminami BHP.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-blue-700">Zasoby</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Narzędzia i szablony</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Publiczne dodatki, które mogą prowadzić użytkowników do serwisu i ułatwiać codzienną pracę.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Najnowszy wpis</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Blog gotowy pod rozbudowę</h2>
            <p className="mt-4 text-slate-600">
              Pierwsze wpisy są w kodzie jako dane startowe. Później możemy podłączyć pliki Markdown, CMS albo automatyzację n8n.
            </p>
          </div>
          <Link href={`/blog/${latestPost.slug}`} className="rounded-lg border border-slate-200 p-6 hover:border-slate-400">
            <p className="text-sm font-semibold text-blue-700">{latestPost.category}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">{latestPost.title}</h3>
            <p className="mt-3 text-slate-600">{latestPost.description}</p>
            <p className="mt-5 text-sm font-semibold text-slate-950">Czytaj wpis</p>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-950">Narzędzia</h2>
            <Link href="/tools" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
              Zobacz wszystkie
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {tools.slice(0, 2).map((tool) => (
              <div key={tool.title} className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-slate-950">{tool.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-950">Szablony</h2>
            <Link href="/templates" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
              Zobacz wszystkie
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {templates.slice(0, 2).map((template) => (
              <div key={template.title} className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-slate-950">{template.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

