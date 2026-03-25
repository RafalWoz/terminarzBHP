import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "noreply@pilnujterminow.pl";

export interface ReminderEmailData {
  ownerEmail: string;
  ownerName?: string | null;
  employeeName: string;
  deadlineName: string;
  expiresAt: Date;
  daysLeft: number;
}

export async function sendOwnerReminder(data: ReminderEmailData) {
  const urgency =
    data.daysLeft <= 0
      ? "WYGASLO"
      : data.daysLeft <= 7
        ? "PILNE"
        : data.daysLeft <= 14
          ? "Wazne"
          : "Przypomnienie";

  const subject =
    data.daysLeft <= 0
      ? `[${urgency}] ${data.employeeName} — ${data.deadlineName} wygaslo`
      : `[${urgency}] ${data.employeeName} — ${data.deadlineName} wygasa za ${data.daysLeft} dni`;

  const expiryStr = data.expiresAt.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${data.daysLeft <= 0 ? "#dc2626" : data.daysLeft <= 7 ? "#ef4444" : "#f59e0b"}; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">
          ${data.daysLeft <= 0 ? "Termin wygasl!" : `Termin wygasa za ${data.daysLeft} dni`}
        </h1>
      </div>
      <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 140px;">Pracownik:</td>
            <td style="padding: 8px 0; font-weight: bold;">${data.employeeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Dokument:</td>
            <td style="padding: 8px 0; font-weight: bold;">${data.deadlineName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Data wygasniecia:</td>
            <td style="padding: 8px 0; font-weight: bold; color: ${data.daysLeft <= 7 ? "#dc2626" : "#111827"};">${expiryStr}</td>
          </tr>
        </table>
        <div style="margin-top: 24px;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard"
             style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            Otworz dashboard
          </a>
        </div>
        <p style="margin-top: 24px; color: #9ca3af; font-size: 12px;">
          Ta wiadomosc zostala wyslana automatycznie przez PilnujTerminow.pl
        </p>
      </div>
    </div>
  `;

  return resend.emails.send({
    from: FROM,
    to: data.ownerEmail,
    subject,
    html,
  });
}

export async function sendEmployeeReminder(data: {
  employeeEmail: string;
  employeeName: string;
  deadlineName: string;
  expiresAt: Date;
  daysLeft: number;
}) {
  const expiryStr = data.expiresAt.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Przypomnienie o terminie</h1>
      </div>
      <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <p>Czesc ${data.employeeName},</p>
        <p>Przypominamy, ze Twoje <strong>${data.deadlineName}</strong> wygasa
           <strong style="color: #dc2626;">${expiryStr}</strong>
           (za ${data.daysLeft} dni).</p>
        <p>Skontaktuj sie ze swoim pracodawca, aby umowic wizyte/szkolenie w odpowiednim terminie.</p>
        <p style="margin-top: 24px; color: #9ca3af; font-size: 12px;">
          Ta wiadomosc zostala wyslana automatycznie przez PilnujTerminow.pl
        </p>
      </div>
    </div>
  `;

  return resend.emails.send({
    from: FROM,
    to: data.employeeEmail,
    subject: `Przypomnienie: ${data.deadlineName} wygasa za ${data.daysLeft} dni`,
    html,
  });
}
