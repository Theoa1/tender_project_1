import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getOwnerSession } from '@/lib/auth';
import { sendStatusUpdateEmail } from '@/lib/email';
import { sendStatusUpdateSms } from '@/lib/sms';

export const runtime = 'nodejs';

const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  service: z.string().min(2).max(120).optional(),
  preferredDate: z.string().min(8).optional(),
  preferredTime: z.string().min(2).max(40).optional(),
  message: z.string().max(2000).optional().nullable(),
  notify: z.boolean().optional().default(true),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const existing = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { status, service, preferredDate, preferredTime, message, notify } = parsed.data;
  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (service) data.service = service;
  if (preferredTime) data.preferredTime = preferredTime;
  if (message !== undefined) data.message = message?.trim() || null;
  if (preferredDate) {
    const d = new Date(preferredDate + 'T00:00:00');
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }
    data.preferredDate = d;
  }

  const updated = await prisma.booking.update({ where: { id: params.id }, data });

  const statusChanged = status && status !== existing.status;
  const triggerNotify =
    notify && statusChanged && (status === 'confirmed' || status === 'cancelled' || status === 'completed');
  if (triggerNotify) {
    const when = `${updated.preferredDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} at ${updated.preferredTime}`;
    Promise.allSettled([
      sendStatusUpdateEmail(updated, status as 'confirmed' | 'cancelled' | 'completed'),
      updated.phone
        ? sendStatusUpdateSms(
            updated.phone,
            updated.name,
            status as 'confirmed' | 'cancelled' | 'completed',
            when
          )
        : Promise.resolve(),
    ]).catch(() => {});
  }

  return NextResponse.json({ booking: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.booking.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
