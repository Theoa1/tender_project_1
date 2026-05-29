import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getOwnerSession } from '@/lib/auth';

export const runtime = 'nodejs';

function canManageAdmins(role: string) {
  return role === 'owner' || role === 'admin';
}

const patchSchema = z.object({
  role: z.enum(['admin', 'viewer']).optional(),
  password: z.string().min(8).max(200).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const target = await prisma.admin.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isSelf = target.id === session.sub;
  const data: Record<string, unknown> = {};

  if (parsed.data.password) {
    // Only the user themselves can change their own password.
    if (!isSelf) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    data.passwordHash = bcrypt.hashSync(parsed.data.password, 10);
  }

  if (parsed.data.role) {
    if (!canManageAdmins(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (target.role === 'owner') {
      return NextResponse.json({ error: "Owner role can't be changed." }, { status: 400 });
    }
    data.role = parsed.data.role;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  await prisma.admin.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getOwnerSession();
  if (!session || !canManageAdmins(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const target = await prisma.admin.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.role === 'owner') {
    return NextResponse.json({ error: 'The owner cannot be removed.' }, { status: 400 });
  }
  if (target.id === session.sub) {
    return NextResponse.json({ error: "You can't remove yourself." }, { status: 400 });
  }
  await prisma.admin.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
