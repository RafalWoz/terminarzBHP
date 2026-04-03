import { NextResponse } from "next/server";
import { checkDeadlinesAndNotify } from "@/lib/notifications";

// Ten endpoint jest wywolywany przez zewnetrzny cron (np. cron-job.org lub Vercel Cron)
// Zabezpieczony tajnym tokenem w headerze
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkDeadlinesAndNotify();
    console.log(`[CRON] Sprawdzono ${result.total} terminow, wyslano ${result.notificationsSent} powiadomien`);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[CRON] Blad:", err);
    return NextResponse.json({ error: "Blad crona" }, { status: 500 });
  }
}
