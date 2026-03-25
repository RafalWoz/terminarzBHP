import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  expiresAt: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), "Nieprawidlowa data")
    .optional(),
  notes: z.string().optional(),
});

async function getDeadlineForUser(deadlineId: string, userId: string) {
  return prisma.deadline.findFirst({
    where: {
      id: deadlineId,
      employee: { userId },
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deadline = await getDeadlineForUser(params.id, session.user.id);
  if (!deadline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Reset flag powiadomien jesli zmieniono date
    const resetFlags = data.expiresAt
      ? {
          notifiedAt30: false,
          notifiedAt14: false,
          notifiedAt7: false,
          notifiedAt0: false,
        }
      : {};

    const updated = await prisma.deadline.update({
      where: { id: params.id },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        ...resetFlags,
      },
    });

    return NextResponse.json({ deadline: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Blad serwera" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deadline = await getDeadlineForUser(params.id, session.user.id);
  if (!deadline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.deadline.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
