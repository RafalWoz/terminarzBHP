import { tools } from "@/lib/content";

export const metadata = {
  title: "Narzędzia BHP",
  description: "Planowane narzędzia i kalkulatory BHP w portalu TerminyBHP.",
};

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Narzędzia</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Kalkulatory i pomocniki BHP</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          To miejsce na publiczne narzędzia, które będą wspierać codzienną pracę i prowadzić użytkownika do serwisu.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {tools.map((tool) => (
          <section key={tool.title} className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-blue-700">{tool.status}</p>
            <h2 className="mt-3 text-xl font-bold text-slate-950">{tool.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{tool.description}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
