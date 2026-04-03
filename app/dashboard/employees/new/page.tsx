"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEFAULT_CATEGORIES } from "@/lib/deadlines";

interface DeadlineForm {
  category: string;
  name: string;
  expiresAt: string;
  notes: string;
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    position: "",
    email: "",
    phone: "",
  });
  const [deadlines, setDeadlines] = useState<DeadlineForm[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function addDeadline() {
    setDeadlines((prev) => [
      ...prev,
      { category: "medical", name: "Badanie lekarskie", expiresAt: "", notes: "" },
    ]);
  }

  function updateDeadline(index: number, field: keyof DeadlineForm, value: string) {
    setDeadlines((prev) =>
      prev.map((d, i) => {
        if (i !== index) return d;
        const updated = { ...d, [field]: value };
        // Auto-uzupelnij nazwe gdy zmienia sie kategoria
        if (field === "category") {
          const cat = DEFAULT_CATEGORIES.find((c) => c.value === value);
          if (cat && cat.value !== "custom") updated.name = cat.label;
        }
        return updated;
      })
    );
  }

  function removeDeadline(index: number) {
    setDeadlines((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Stworz pracownika
    const empRes = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const empData = await empRes.json();

    if (!empRes.ok) {
      setError(empData.error ?? "Blad tworzenia pracownika");
      setLoading(false);
      return;
    }

    const employeeId = empData.employee.id;

    // 2. Dodaj terminy
    for (const deadline of deadlines) {
      if (!deadline.expiresAt) continue;
      await fetch("/api/deadlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...deadline, employeeId }),
      });
    }

    router.push("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Wstecz
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nowy pracownik</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dane pracownika */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Dane osobowe</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imie *</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko *</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stanowisko *</label>
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                required
                placeholder="np. Kierowca, Magazynier, Elektryk"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-400 font-normal">(do przypomnien)</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon <span className="text-gray-400 font-normal">(opcjonalnie)</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+48 600 000 000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Terminy */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Terminy</h2>
            <button
              type="button"
              onClick={addDeadline}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Dodaj termin
            </button>
          </div>

          {deadlines.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Kliknij &quot;Dodaj termin&quot; aby dodac badanie lub szkolenie
            </p>
          ) : (
            <div className="space-y-4">
              {deadlines.map((deadline, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Kategoria</label>
                      <select
                        value={deadline.category}
                        onChange={(e) => updateDeadline(i, "category", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {DEFAULT_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Data wygasniecia *</label>
                      <input
                        type="date"
                        value={deadline.expiresAt}
                        onChange={(e) => updateDeadline(i, "expiresAt", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nazwa {deadline.category === "custom" ? "*" : "(opcjonalnie)"}
                      </label>
                      <input
                        value={deadline.name}
                        onChange={(e) => updateDeadline(i, "name", e.target.value)}
                        placeholder="np. Badanie lekarskie okresowe"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDeadline(i)}
                    className="mt-3 text-xs text-red-500 hover:text-red-700"
                  >
                    Usun
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {loading ? "Zapisywanie..." : "Zapisz pracownika"}
          </button>
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-gray-700 py-2 px-4 text-sm"
          >
            Anuluj
          </Link>
        </div>
      </form>
    </div>
  );
}
