import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './prisma';

export type Channel = 'email' | 'phone';
export type Purpose = 'booking' | 'login';

const TTL_MIN = Number(process.env.VERIFICATION_CODE_TTL_MIN || 10);
const MAX_ATTEMPTS = Number(process.env.VERIFICATION_MAX_ATTEMPTS || 5);

/** Generate a cryptographically secure 6-digit code. */
export function generateCode(): string {
  // 0-999999 range, padded
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, '0');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Loose E.164-ish normalization — keep digits and leading +. */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D+/g, '');
  return (hasPlus ? '+' : '') + digits;
}

export function normalizeTarget(channel: Channel, target: string): string {
  return channel === 'email' ? normalizeEmail(target) : normalizePhone(target);
}

/**
 * Issue a verification code. Invalidates any previous unconsumed codes for the
 * same (target, purpose, channel) tuple so only the latest works.
 */
export async function issueCode(channel: Channel, target: string, purpose: Purpose) {
  const normalized = normalizeTarget(channel, target);
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + TTL_MIN * 60_000);

  await prisma.$transaction([
    prisma.verificationCode.updateMany({
      where: {
        channel,
        target: normalized,
        purpose,
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    }),
    prisma.verificationCode.create({
      data: { channel, target: normalized, purpose, codeHash, expiresAt },
    }),
  ]);

  return { code, expiresAt };
}

/**
 * Validate a submitted code. Returns true if it matches an unconsumed,
 * unexpired record (and marks it consumed). Increments attempts on failure.
 */
export async function consumeCode(
  channel: Channel,
  target: string,
  purpose: Purpose,
  submitted: string
): Promise<boolean> {
  const normalized = normalizeTarget(channel, target);
  const clean = submitted.trim();
  if (!/^\d{6}$/.test(clean)) return false;

  const record = await prisma.verificationCode.findFirst({
    where: {
      channel,
      target: normalized,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) return false;

  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() }, // burn it
    });
    return false;
  }

  const ok = await bcrypt.compare(clean, record.codeHash);
  if (!ok) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }

  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });
  return true;
}

/** Best-effort cleanup of old expired codes. Safe to call opportunistically. */
export async function purgeExpired() {
  try {
    await prisma.verificationCode.deleteMany({
      where: { expiresAt: { lt: new Date(Date.now() - 24 * 3600_000) } },
    });
  } catch {
    /* ignore */
  }
}
