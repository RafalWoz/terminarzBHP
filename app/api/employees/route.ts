import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/deadlines";
import { z } from "zod";

const employeeSchema = z.object({
  firstName: z.string().min(1, "Imie jest wymagane"),
  lastName: z.string().min(1, "Nazwisko jest wymagane"),
  position: z.string().min(1, "Stanowisko jest wymagane"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employees = await prisma.employee.findMany({
    where: { userId: session.user.id, active: true },
    include: {
      deadlines: {
        orderBy: { expiresAt: "asc" },
      },
    },
    orderBy: { lastName: "asc" },
  });

  return NextResponse.json({ employees });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = employeeSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const currentCount = await prisma.employee.count({
      where: { userId: session.user.id, active: true },
    });

    const limit = PLAN_LIMITS[user.plan];
    if (currentCount >= limit) {
      return NextResponse.json(
        {
          error: `Limit pracownikow dla planu ${user.plan}: ${limit}. Przejdz na wyzszy plan.`,
          limitReached: true,
        },
        { status: 403 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        userId: session.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        email: data.email || null,
        phone: data.phone || null,
      },
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Blad serwera" }, { status: 500 });
  }
}
