import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { issueCode, normalizeEmail, normalizePhone, purgeExpired } from '@/lib/verify';
import { sendVerificationEmail } from '@/lib/email';
import { sendVerificationSms } from '@/lib/sms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(7).optional(),
  purpose: z.enum(['booking', 'login']),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { email, phone, purpose } = parsed.data;

  if (!email && !phone) {
    return NextResponse.json({ error: 'Provide email or phone.' }, { status: 400 });
  }
  if (purpose === 'login' && !email) {
    return NextResponse.json({ error: 'Email is required to sign in.' }, { status: 400 });
  }

  const tasks: Promise<unknown>[] = [];
  const status: { email?: 'sent' | 'failed'; phone?: 'sent' | 'failed' } = {};

  if (email) {
    tasks.push(
      (async () => {
        try {
          const { code } = await issueCode('email', email, purpose);
          await sendVerificationEmail(normalizeEmail(email), code, purpose);
          status.email = 'sent';
        } catch (e) {
          console.error('email verify send failed', e);
          status.email = 'failed';
        }
      })()
    );
  }
  if (phone) {
    tasks.push(
      (async () => {
        try {
          const { code } = await issueCode('phone', phone, purpose);
          await sendVerificationSms(normalizePhone(phone), code);
          status.phone = 'sent';
        } catch (e) {
          console.error('sms verify send failed', e);
          status.phone = 'failed';
        }
      })()
    );
  }

  await Promise.allSettled(tasks);
  purgeExpired();

  const anySent = status.email === 'sent' || status.phone === 'sent';
  if (!anySent) {
    return NextResponse.json(
      { error: 'Could not send verification code. Please try again.' },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true, status });
}
