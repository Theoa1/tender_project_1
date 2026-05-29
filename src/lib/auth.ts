import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-insecure-secret-change-me-please-change-now'
);

const OWNER_COOKIE = 'tcc_session';
const CLIENT_COOKIE = 'tcc_client';
const OWNER_MAX_AGE = 60 * 60 * 8; // 8h
const CLIENT_MAX_AGE = 60 * 60 * 24 * 30; // 30d

export type AdminRole = 'owner' | 'admin' | 'viewer';
export type OwnerSession = {
  sub: string; // admin id
  email: string;
  role: AdminRole;
};
export type ClientSession = { sub: string; role: 'client'; email: string };
export type SessionPayload = OwnerSession; // back-compat

async function sign(payload: Record<string, unknown>, ttl: number): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(SECRET);
}

async function verifyToken<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as T;
  } catch {
    return null;
  }
}

// ---------- Owner session ----------
export async function signOwnerSession(payload: OwnerSession) {
  return sign(payload, OWNER_MAX_AGE);
}
export async function verifyOwnerSession(token: string | undefined) {
  const p = await verifyToken<OwnerSession>(token);
  return p && (p.role === 'owner' || p.role === 'admin' || p.role === 'viewer') ? p : null;
}
export async function getOwnerSession(): Promise<OwnerSession | null> {
  return verifyOwnerSession(cookies().get(OWNER_COOKIE)?.value);
}
export async function setOwnerCookie(token: string) {
  cookies().set(OWNER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: OWNER_MAX_AGE,
  });
}
export async function clearOwnerCookie() {
  cookies().delete(OWNER_COOKIE);
}

// ---------- Client session (passwordless) ----------
export async function signClientSession(email: string) {
  return sign({ sub: email, role: 'client', email }, CLIENT_MAX_AGE);
}
export async function verifyClientSession(token: string | undefined) {
  const p = await verifyToken<ClientSession>(token);
  return p && p.role === 'client' ? p : null;
}
export async function getClientSession(): Promise<ClientSession | null> {
  return verifyClientSession(cookies().get(CLIENT_COOKIE)?.value);
}
export async function setClientCookie(token: string) {
  cookies().set(CLIENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CLIENT_MAX_AGE,
  });
}
export async function clearClientCookie() {
  cookies().delete(CLIENT_COOKIE);
}

// ---------- Admin credentials (DB-backed) ----------
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ id: string; email: string; role: AdminRole } | null> {
  // Lazy-import so this file stays edge-safe for middleware (no Prisma in Edge).
  const { prisma } = await import('./prisma');
  const { ensureSeed } = await import('./settings');
  await ensureSeed();
  const normalized = email.toLowerCase().trim();
  const admin = await prisma.admin.findUnique({ where: { email: normalized } });
  if (!admin || !admin.passwordHash) return null;
  try {
    const ok = bcrypt.compareSync(password, admin.passwordHash);
    if (!ok) return null;
    return { id: admin.id, email: admin.email, role: admin.role as AdminRole };
  } catch {
    return null;
  }
}

// Back-compat synchronous shim used by older code paths (always returns false).
// New code must use verifyAdminCredentials.
export function verifyOwnerCredentials(_email: string, _password: string): boolean {
  return false;
}

export const SESSION_COOKIE = OWNER_COOKIE;
export const CLIENT_COOKIE_NAME = CLIENT_COOKIE;

// ---------- Back-compat shims ----------
export const signSession = signOwnerSession;
export const verifySession = verifyOwnerSession;
export const getSession = getOwnerSession;
export const setSessionCookie = setOwnerCookie;
export const clearSessionCookie = clearOwnerCookie;
