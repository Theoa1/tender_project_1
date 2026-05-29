import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const SETTING_KEYS = {
  ownerNotifyEmail: 'owner_notify_email',
} as const;

export const DEFAULTS = {
  ownerEmail: 'hello@tendercare.com',
  ownerPassword: '1234567890',
  notifyEmail: 'arthur0theo@icloud.com',
};

let seededOnce = false;

/**
 * Ensures the first owner admin and default settings exist.
 * Safe to call repeatedly — no-ops after first success per process.
 */
export async function ensureSeed(): Promise<void> {
  if (seededOnce) return;
  try {
    const count = await prisma.admin.count();
    if (count === 0) {
      const hash = bcrypt.hashSync(DEFAULTS.ownerPassword, 10);
      await prisma.admin.create({
        data: {
          email: DEFAULTS.ownerEmail.toLowerCase(),
          passwordHash: hash,
          role: 'owner',
        },
      });
    }
    const existing = await prisma.setting.findUnique({
      where: { key: SETTING_KEYS.ownerNotifyEmail },
    });
    if (!existing) {
      await prisma.setting.create({
        data: { key: SETTING_KEYS.ownerNotifyEmail, value: DEFAULTS.notifyEmail },
      });
    }
    seededOnce = true;
  } catch (e) {
    // Don't cache failure — let next call retry (e.g. DB not ready yet)
    console.error('[seed] failed:', e);
  }
}

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getOwnerNotifyEmail(): Promise<string | null> {
  return (
    (await getSetting(SETTING_KEYS.ownerNotifyEmail)) ||
    process.env.OWNER_NOTIFY_EMAIL ||
    null
  );
}
