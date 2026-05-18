import { templates } from "@/lib/content";

export const metadata = {
  title: "Szablony BHP",
  description: "Planowane szablony dokumentów, rejestrów i checklist BHP w TerminyBHP.",
};

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Szablony</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Dokumenty i checklisty</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Sekcja pod gotowe wzory, które będą dostępne publicznie i połączone z pracą w serwisie.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {templates.map((template) => (
          <section key={template.title} className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-blue-700">{template.status}</p>
            <h2 className="mt-3 text-xl font-bold text-slate-950">{template.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{template.description}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
