import { templates } from "@/lib/content";
import { canonicalUrl } from "@/lib/seo";

export const metadata = {
  title: "Szablony BHP",
  description: "Planowane szablony dokumentów, rejestrów i checklist BHP w TerminyBHP.",
  alternates: { canonical: canonicalUrl("/templates/") },
};

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-[1160px] px-5 py-14 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[var(--teal-700)]">Szablony</p>
        <h1 className="mt-3 text-5xl font-black leading-[0.98] tracking-[-0.055em] text-[var(--navy-950)]">
          Dokumenty i checklisty
        </h1>
        <p className="mt-5 text-lg leading-8 text-[var(--slate-700)]">
          Gotowe wzory mają skracać drogę od pytania „co mam zrobić?” do konkretnego rejestru, listy lub decyzji.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {templates.map((template) => (
          <section key={template.title} className="rounded-[24px] border border-[var(--slate-200)] bg-white p-6 shadow-[0_8px_24px_rgba(7,24,38,0.05)]">
            <p className="inline-flex rounded-full bg-[var(--green-50)] px-3 py-1.5 text-xs font-extrabold text-[var(--teal-700)]">{template.status}</p>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[var(--navy-950)]">{template.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--slate-700)]">{template.description}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
