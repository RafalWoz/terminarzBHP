"use client";

import { useRouter } from "next/navigation";

export function DeleteEmployeeButton({ employeeId }: { employeeId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Archiwizowac tego pracownika? Jego terminy nie beda juz sledzone.")) return;

    await fetch(`/api/employees/${employeeId}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-400 hover:text-red-600"
    >
      Archiwizuj
    </button>
  );
}
