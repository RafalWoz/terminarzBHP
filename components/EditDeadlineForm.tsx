"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditDeadlineForm({
  deadlineId,
  currentDate,
  currentName,
}: {
  deadlineId: string;
  currentDate: string;
  currentName: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(currentDate);
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch(`/api/deadlines/${deadlineId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresAt: date, name }),
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Usunac ten termin?")) return;
    await fetch(`/api/deadlines/${deadlineId}`, { method: "DELETE" });
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex gap-2 ml-4">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Edytuj
        </button>
        <button
          onClick={remove}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Usun
        </button>
      </div>
    );
  }

  return (
    <div className="ml-4 flex flex-col gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={loading}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : "Zapisz"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Anuluj
        </button>
      </div>
    </div>
  );
}
