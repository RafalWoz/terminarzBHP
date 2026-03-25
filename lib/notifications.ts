import { prisma } from "@/lib/prisma";
import { sendOwnerReminder, sendEmployeeReminder } from "@/lib/email";
import { getDaysLeft } from "@/lib/deadlines";

/**
 * Glowna funkcja sprawdzajaca terminy i wysylajaca powiadomienia.
 * Wywolywana codziennie rano przez cron job.
 */
export async function checkDeadlinesAndNotify() {
  const deadlines = await prisma.deadline.findMany({
    include: {
      employee: {
        include: {
          user: true,
        },
      },
    },
  });

  let notificationsSent = 0;
  const errors: string[] = [];

  for (const deadline of deadlines) {
    if (!deadline.employee.active) continue;

    const daysLeft = getDaysLeft(deadline.expiresAt);
    const owner = deadline.employee.user;
    const employee = deadline.employee;
    const employeeName = `${employee.firstName} ${employee.lastName}`;

    try {
      // 30 dni przed
      if (daysLeft === 30 && !deadline.notifiedAt30) {
        await sendOwnerReminder({
          ownerEmail: owner.email,
          ownerName: owner.name,
          employeeName,
          deadlineName: deadline.name,
          expiresAt: deadline.expiresAt,
          daysLeft,
        });
        await prisma.deadline.update({
          where: { id: deadline.id },
          data: { notifiedAt30: true },
        });
        await logNotification(deadline.id, "email_owner", daysLeft, true);
        notificationsSent++;
      }

      // 14 dni przed — email do wlasciciela + do pracownika jesli ma email
      if (daysLeft === 14 && !deadline.notifiedAt14) {
        await sendOwnerReminder({
          ownerEmail: owner.email,
          ownerName: owner.name,
          employeeName,
          deadlineName: deadline.name,
          expiresAt: deadline.expiresAt,
          daysLeft,
        });
        await logNotification(deadline.id, "email_owner", daysLeft, true);
        notificationsSent++;

        if (employee.email) {
          await sendEmployeeReminder({
            employeeEmail: employee.email,
            employeeName,
            deadlineName: deadline.name,
            expiresAt: deadline.expiresAt,
            daysLeft,
          });
          await logNotification(deadline.id, "email_employee", daysLeft, true);
          notificationsSent++;
        }

        await prisma.deadline.update({
          where: { id: deadline.id },
          data: { notifiedAt14: true },
        });
      }

      // 7 dni przed
      if (daysLeft === 7 && !deadline.notifiedAt7) {
        await sendOwnerReminder({
          ownerEmail: owner.email,
          ownerName: owner.name,
          employeeName,
          deadlineName: deadline.name,
          expiresAt: deadline.expiresAt,
          daysLeft,
        });
        await logNotification(deadline.id, "email_owner", daysLeft, true);
        notificationsSent++;

        if (employee.email) {
          await sendEmployeeReminder({
            employeeEmail: employee.email,
            employeeName,
            deadlineName: deadline.name,
            expiresAt: deadline.expiresAt,
            daysLeft,
          });
          await logNotification(deadline.id, "email_employee", daysLeft, true);
          notificationsSent++;
        }

        await prisma.deadline.update({
          where: { id: deadline.id },
          data: { notifiedAt7: true },
        });
      }

      // Dzien wygasniecia (daysLeft === 0)
      if (daysLeft === 0 && !deadline.notifiedAt0) {
        await sendOwnerReminder({
          ownerEmail: owner.email,
          ownerName: owner.name,
          employeeName,
          deadlineName: deadline.name,
          expiresAt: deadline.expiresAt,
          daysLeft,
        });
        await logNotification(deadline.id, "email_owner", daysLeft, true);
        notificationsSent++;

        await prisma.deadline.update({
          where: { id: deadline.id },
          data: { notifiedAt0: true },
        });
      }
    } catch (err) {
      const msg = `Deadline ${deadline.id}: ${err instanceof Error ? err.message : "unknown error"}`;
      errors.push(msg);
      console.error(msg);
    }
  }

  return { notificationsSent, errors, total: deadlines.length };
}

async function logNotification(
  deadlineId: string,
  type: string,
  daysLeft: number,
  success: boolean,
  error?: string
) {
  await prisma.notificationLog.create({
    data: {
      deadlineId,
      type,
      daysLeft,
      success,
      error: error ?? null,
    },
  });
}
