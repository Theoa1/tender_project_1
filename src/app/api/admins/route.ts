import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getOwnerSession } from '@/lib/auth';
import { ensureSeed } from '@/lib/settings';
import { sendAdminInviteEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function canManageAdmins(role: string) {
  return role === 'owner' || role === 'admin';
}

export async function GET() {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureSeed();
  const admins = await prisma.admin.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      passwordHash: true,
      inviteExpires: true,
    },
  });
  const list = admins.map((a) => ({
    id: a.id,
    email: a.email,
    role: a.role,
    createdAt: a.createdAt.toISOString(),
    status: a.passwordHash
      ? 'active'
      : a.inviteExpires && a.inviteExpires > new Date()
      ? 'invited'
      : 'expired',
  }));
  return NextResponse.json({ admins: list, me: session });
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'viewer']),
});

export async function POST(req: NextRequest) {
  const session = await getOwnerSession();
  if (!session || !canManageAdmins(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing && existing.passwordHash) {
    return NextResponse.json({ error: 'That admin already exists.' }, { status: 409 });
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48h
  const record = existing
    ? await prisma.admin.update({
        where: { email },
        data: { role: parsed.data.role, inviteToken: token, inviteExpires: expires, invitedBy: session.email },
      })
    : await prisma.admin.create({
        data: {
          email,
          role: parsed.data.role,
          inviteToken: token,
          inviteExpires: expires,
          invitedBy: session.email,
        },
      });

  const origin = process.env.NEXT_PUBLIC_SITE_URL || '';
  const link = `${origin}/admin/setup?token=${token}`;
  // Fire-and-forget invite email
  sendAdminInviteEmail(email, link, session.email, parsed.data.role).catch((e) =>
    console.error('invite email failed', e)
  );

  return NextResponse.json({
    ok: true,
    id: record.id,
    inviteLink: link, // returned so the owner can copy/paste if email isn't configured
  });
}
