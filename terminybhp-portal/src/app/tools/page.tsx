import { tools } from "@/lib/content";

export const metadata = {
  title: "Narzędzia BHP",
  description: "Planowane narzędzia i kalkulatory BHP w portalu TerminyBHP.",
  alternates: { canonical: "https://terminybhp.pl/tools/" },
};

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-[1160px] px-5 py-14 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--teal-700)]">Narzędzia</p>
        <h1 className="mt-3 text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[var(--navy-950)]">
          Kalkulatory i pomocniki BHP
        </h1>
        <p className="mt-5 text-lg leading-8 text-[var(--slate-700)]">
          Publiczne narzędzia mają prowadzić do decyzji: policzyć termin, przygotować checklistę albo przenieść dane do serwisu.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {tools.map((tool) => (
          <section key={tool.title} className="rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)]">
            <p className="inline-flex rounded-full bg-[var(--green-50)] px-3 py-1.5 text-xs font-extrabold text-[var(--teal-700)]">{tool.status}</p>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[var(--navy-950)]">{tool.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--slate-700)]">{tool.description}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
