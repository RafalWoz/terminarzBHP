import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import Link from "next/link";
import {
  getDeadlineStatus,
  getDaysLeft,
  STATUS_COLORS,
  DEFAULT_CATEGORIES,
} from "@/lib/deadlines";
import { EditDeadlineForm } from "@/components/EditDeadlineForm";
import { AddDeadlineForm } from "@/components/AddDeadlineForm";
import { DeleteEmployeeButton } from "@/components/DeleteEmployeeButton";

export default async function EmployeePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const employee = await prisma.employee.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { deadlines: { orderBy: { expiresAt: "asc" } } },
  });

  if (!employee || !employee.active) notFound();

  function getCategoryLabel(cat: string) {
    return DEFAULT_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            {employee.firstName} {employee.lastName}
          </h1>
        </div>
        <DeleteEmployeeButton employeeId={employee.id} />
      </div>

      {/* Info o pracowniku */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Stanowisko:</span>
            <span className="ml-2 font-medium text-gray-900">{employee.position}</span>
          </div>
          {employee.email && (
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2 text-gray-700">{employee.email}</span>
            </div>
          )}
          {employee.phone && (
            <div>
              <span className="text-gray-500">Telefon:</span>
              <span className="ml-2 text-gray-700">{employee.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminy */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Terminy</h2>
        </div>

        {employee.deadlines.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Brak terminow</p>
        ) : (
          <div className="space-y-3">
            {employee.deadlines.map((deadline) => {
              const status = getDeadlineStatus(deadline.expiresAt);
              const daysLeft = getDaysLeft(deadline.expiresAt);

              return (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 text-sm">
                        {deadline.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                        {status === "expired"
                          ? `Wygaslo ${Math.abs(daysLeft)} dni temu`
                          : status === "critical"
                            ? `Za ${daysLeft} dni — PILNE`
                            : status === "warning"
                              ? `Za ${daysLeft} dni`
                              : `Za ${daysLeft} dni`}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {getCategoryLabel(deadline.category)} ·{" "}
                      {format(deadline.expiresAt, "d MMMM yyyy", { locale: pl })}
                    </div>
                  </div>
                  <EditDeadlineForm
                    deadlineId={deadline.id}
                    currentDate={format(deadline.expiresAt, "yyyy-MM-dd")}
                    currentName={deadline.name}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dodaj termin */}
      <AddDeadlineForm employeeId={employee.id} />
    </div>
  );
}
