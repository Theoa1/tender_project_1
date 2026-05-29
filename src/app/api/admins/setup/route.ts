import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signOwnerSession, setOwnerCookie } from '@/lib/auth';
import type { AdminRole } from '@/lib/auth';

export const runtime = 'nodejs';

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(200),
});

// GET — validate token, return associated email (for display only)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  const admin = await prisma.admin.findUnique({ where: { inviteToken: token } });
  if (!admin || !admin.inviteExpires || admin.inviteExpires < new Date()) {
    return NextResponse.json({ error: 'Invite is invalid or expired.' }, { status: 410 });
  }
  return NextResponse.json({ email: admin.email, role: admin.role });
}

// POST — accept invite, set password, log them in
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const admin = await prisma.admin.findUnique({ where: { inviteToken: parsed.data.token } });
  if (!admin || !admin.inviteExpires || admin.inviteExpires < new Date()) {
    return NextResponse.json({ error: 'Invite is invalid or expired.' }, { status: 410 });
  }

  const hash = bcrypt.hashSync(parsed.data.password, 10);
  const updated = await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: hash, inviteToken: null, inviteExpires: null },
  });

  const token = await signOwnerSession({
    sub: updated.id,
    email: updated.email,
    role: updated.role as AdminRole,
  });
  await setOwnerCookie(token);
  return NextResponse.json({ ok: true, role: updated.role });
}
