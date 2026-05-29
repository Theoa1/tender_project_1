import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendClientConfirmation, sendOwnerNotification } from '@/lib/email';
import { sendClientSms } from '@/lib/sms';
import { getOwnerSession } from '@/lib/auth';
import { consumeCode, normalizeEmail, normalizePhone } from '@/lib/verify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bookingSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200).optional().or(z.literal('')),
    phone: z.string().min(7).max(40).optional().or(z.literal('')),
    service: z.string().min(2).max(120),
    preferredDate: z.string().min(8),
    preferredTime: z.string().min(2).max(40),
    message: z.string().max(2000).optional().nullable(),
    emailCode: z.string().regex(/^\d{6}$/).optional(),
    phoneCode: z.string().regex(/^\d{6}$/).optional(),
  })
  .refine((d) => !!(d.email || d.phone), {
    message: 'Provide an email or phone number.',
    path: ['email'],
  });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form fields and try again.' },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const date = new Date(data.preferredDate + 'T00:00:00');
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const email = data.email ? normalizeEmail(data.email) : null;
  const phone = data.phone ? normalizePhone(data.phone) : null;

  // Each provided channel must be verified with its code.
  if (email && !data.emailCode) {
    return NextResponse.json({ error: 'Missing email code' }, { status: 400 });
  }
  if (phone && !data.phoneCode) {
    return NextResponse.json({ error: 'Missing phone code' }, { status: 400 });
  }

  const checks: Promise<boolean>[] = [];
  if (email && data.emailCode) checks.push(consumeCode('email', email, 'booking', data.emailCode));
  if (phone && data.phoneCode) checks.push(consumeCode('phone', phone, 'booking', data.phoneCode));
  let results: boolean[];
  try {
    results = await Promise.all(checks);
  } catch (e) {
    console.error('verify check failed', e);
    return NextResponse.json(
      { error: 'Could not verify code right now. Please try again.' },
      { status: 503 }
    );
  }
  if (results.some((ok) => !ok)) {
    return NextResponse.json(
      { error: 'Verification failed. Please request new codes and try again.' },
      { status: 401 }
    );
  }

  let booking;
  try {
    booking = await prisma.booking.create({
      data: {
        name: data.name.trim(),
        email,
        phone,
        service: data.service,
        preferredDate: date,
        preferredTime: data.preferredTime,
        message: data.message?.trim() || null,
        emailVerified: !!email,
        phoneVerified: !!phone,
      },
    });
  } catch (e) {
    console.error('booking create failed', e);
    return NextResponse.json(
      { error: 'Could not save the booking. Please try again in a moment.' },
      { status: 503 }
    );
  }

  // Fire-and-forget notifications; each one self-handles errors so this can't crash.
  Promise.allSettled([
    email ? sendClientConfirmation(booking).catch((e) => console.error('client email', e)) : Promise.resolve(),
    sendOwnerNotification(booking).catch((e) => console.error('owner email', e)),
    phone ? sendClientSms(phone, booking.name).catch((e) => console.error('client sms', e)) : Promise.resolve(),
  ]);

  return NextResponse.json({ id: booking.id, ok: true }, { status: 201 });
}

export async function GET() {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ bookings });
  } catch (e) {
    console.error('list bookings failed', e);
    return NextResponse.json({ error: 'Could not load bookings.' }, { status: 503 });
  }
}
