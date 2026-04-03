import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const deadlineSchema = z.object({
  employeeId: z.string().min(1),
  category: z.string().min(1),
  name: z.string().min(1, "Nazwa terminu jest wymagana"),
  expiresAt: z.string().refine((d) => !isNaN(Date.parse(d)), "Nieprawidlowa data"),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = deadlineSchema.parse(body);

    // Sprawdz czy pracownik nalezy do zalogowanego uzytkownika
    const employee = await prisma.employee.findFirst({
      where: { id: data.employeeId, userId: session.user.id },
    });

    if (!employee) return NextResponse.json({ error: "Pracownik nie istnieje" }, { status: 404 });

    const deadline = await prisma.deadline.create({
      data: {
        employeeId: data.employeeId,
        category: data.category,
        name: data.name,
        expiresAt: new Date(data.expiresAt),
        notes: data.notes ?? null,
      },
    });

    return NextResponse.json({ deadline }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Blad serwera" }, { status: 500 });
  }
}
