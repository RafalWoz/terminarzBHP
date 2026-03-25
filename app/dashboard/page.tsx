import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getDeadlineStatus, getDaysLeft, STATUS_DOT, PLAN_LIMITS } from "@/lib/deadlines";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, companyName: true },
  });

  const employees = await prisma.employee.findMany({
    where: { userId: session.user.id, active: true },
    include: {
      deadlines: { orderBy: { expiresAt: "asc" } },
    },
    orderBy: { lastName: "asc" },
  });

  const plan = user?.plan ?? "FREE";
  const limit = PLAN_LIMITS[plan];
  const employeeCount = employees.length;

  // Podsumowanie alertow
  const allDeadlines = employees.flatMap((e) => e.deadlines);
  const expiredCount = allDeadlines.filter((d) => getDeadlineStatus(d.expiresAt) === "expired").length;
  const criticalCount = allDeadlines.filter((d) => getDeadlineStatus(d.expiresAt) === "critical").length;
  const warningCount = allDeadlines.filter((d) => getDeadlineStatus(d.expiresAt) === "warning").length;

  return (
    <div>
      {/* Naglowek */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.companyName ?? "Twoja firma"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {employeeCount} / {limit === Infinity ? "∞" : limit} pracownikow · Plan {plan}
          </p>
        </div>
        <Link
          href="/dashboard/employees/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Dodaj pracownika
        </Link>
      </div>

      {/* Podsumowanie */}
      {(expiredCount > 0 || criticalCount > 0 || warningCount > 0) && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {expiredCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-700">{expiredCount}</div>
              <div className="text-sm text-red-600">Wygasle terminy</div>
            </div>
          )}
          {criticalCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-700">{criticalCount}</div>
              <div className="text-sm text-orange-600">Wygasaja za &lt;7 dni</div>
            </div>
          )}
          {warningCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-700">{warningCount}</div>
              <div className="text-sm text-yellow-600">Wygasaja za &lt;30 dni</div>
            </div>
          )}
        </div>
      )}

      {/* Tabela pracownikow */}
      {employees.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Brak pracownikow</h2>
          <p className="text-gray-500 text-sm mb-6">
            Dodaj pierwszego pracownika i zaczaz sledzic terminy BHP
          </p>
          <Link
            href="/dashboard/employees/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Dodaj pracownika
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Pracownik</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Stanowisko</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status terminow</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Najblizszy termin</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const deadlines = employee.deadlines;

                // Najgorszy status wsrod terminow
                const statuses = deadlines.map((d) => getDeadlineStatus(d.expiresAt));
                const overallStatus = statuses.includes("expired")
                  ? "expired"
                  : statuses.includes("critical")
                    ? "critical"
                    : statuses.includes("warning")
                      ? "warning"
                      : "ok";

                // Najblizszy termin
                const nearest = deadlines[0];

                return (
                  <tr key={employee.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${STATUS_DOT[overallStatus]}`}
                        />
                        <span className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{employee.position}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{deadlines.length} termin(ow)</span>
                    </td>
                    <td className="px-4 py-3">
                      {nearest ? (
                        <div>
                          <div className="text-gray-700">{nearest.name}</div>
                          <div
                            className={`text-xs ${
                              getDeadlineStatus(nearest.expiresAt) === "expired"
                                ? "text-red-600 font-medium"
                                : getDeadlineStatus(nearest.expiresAt) === "critical"
                                  ? "text-red-500"
                                  : getDeadlineStatus(nearest.expiresAt) === "warning"
                                    ? "text-yellow-600"
                                    : "text-gray-400"
                            }`}
                          >
                            {getDeadlineStatus(nearest.expiresAt) === "expired"
                              ? `Wygaslo ${Math.abs(getDaysLeft(nearest.expiresAt))} dni temu`
                              : `${format(nearest.expiresAt, "d MMM yyyy", { locale: pl })} · za ${getDaysLeft(nearest.expiresAt)} dni`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Brak terminow</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/employees/${employee.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Szczegoly →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
