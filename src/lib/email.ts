import nodemailer from 'nodemailer';
import { getOwnerNotifyEmail } from './settings';

type Booking = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  service: string;
  preferredDate: Date;
  preferredTime: string;
  message?: string | null;
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    // Hard timeouts so a slow SMTP server can never hang a request.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
  });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const brand = '#7B5BC5';

function shell(title: string, inner: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f4fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f1b2e">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center">
    <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(60,40,120,.08)">
      <tr><td style="background:linear-gradient(135deg,${brand},#3FC1B0);padding:24px 28px;color:#fff">
        <div style="font-size:20px;font-weight:700;letter-spacing:.5px">TENDER CHILD CARE</div>
        <div style="font-size:12px;opacity:.9;margin-top:2px">One Goal, One Passion</div>
      </td></tr>
      <tr><td style="padding:28px">
        <h1 style="margin:0 0 12px;font-size:22px;color:#2a1f4a">${title}</h1>
        ${inner}
      </td></tr>
      <tr><td style="padding:18px 28px;background:#faf8ff;color:#6b647a;font-size:12px">
        Tender Child Care &middot; Tender Loving Parenting Support
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

function bookingRows(b: Booking) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 0;color:#6b647a;width:140px">${k}</td><td style="padding:6px 0;color:#1f1b2e;font-weight:600">${v}</td></tr>`;
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0 16px">
    ${row('Name', b.name)}
    ${row('Email', b.email || '—')}
    ${row('Phone', b.phone || '—')}
    ${row('Service', b.service)}
    ${row('Date', fmtDate(b.preferredDate))}
    ${row('Time', b.preferredTime)}
    ${b.message ? row('Message', b.message) : ''}
    ${row('Reference', b.id)}
  </table>`;
}

export async function sendClientConfirmation(b: Booking) {
  const t = getTransporter();
  if (!t || !b.email) return;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const html = shell(
    `Thank you, ${b.name.split(' ')[0]} — your request is in!`,
    `<p style="margin:0 0 12px">We received your consultation request. I'll review it and reach out shortly to confirm the time.</p>
     ${bookingRows(b)}
     <p style="margin:0;color:#6b647a">If anything changes, just reply to this email.</p>`
  );
  await t.sendMail({
    from,
    to: b.email,
    subject: 'We received your consultation request',
    html,
  });
}

export async function sendOwnerNotification(b: Booking) {
  const t = getTransporter();
  if (!t) return;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const to = (await getOwnerNotifyEmail()) || process.env.OWNER_EMAIL;
  if (!to) return;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin`;
  const html = shell(
    'New booking request',
    `<p style="margin:0 0 12px">A new consultation request just came in.</p>
     ${bookingRows(b)}
     <p><a href="${url}" style="display:inline-block;background:${brand};color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Open dashboard</a></p>`
  );
  await t.sendMail({
    from,
    to,
    subject: `New booking: ${b.name} — ${b.service}`,
    html,
  });
}

export async function sendVerificationEmail(
  to: string,
  code: string,
  purpose: 'booking' | 'login'
) {
  const t = getTransporter();
  const title = purpose === 'login' ? 'Your sign-in code' : 'Verify your email';
  if (!t) {
    // Dev-mode fallback: log the code so you can test without SMTP configured.
    console.log(`\n[verify-email] ${title} for ${to}: ${code}\n`);
    return;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const intro =
    purpose === 'login'
      ? 'Use the code below to sign in to your account.'
      : 'Use the code below to verify your email and complete your booking.';
  const html = shell(
    title,
    `<p style="margin:0 0 12px">${intro}</p>
     <div style="font-size:34px;font-weight:800;letter-spacing:8px;background:#faf8ff;border:1px solid #ece6fa;color:#2a1f4a;padding:18px 24px;border-radius:12px;text-align:center;margin:14px 0">${code}</div>
     <p style="margin:0;color:#6b647a;font-size:13px">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>`
  );
  await t.sendMail({ from, to, subject: `${title}: ${code}`, html });
}

export async function sendAdminInviteEmail(
  to: string,
  link: string,
  invitedBy: string,
  role: 'admin' | 'viewer'
) {
  const t = getTransporter();
  const title = "You've been invited as an admin";
  if (!t) {
    console.log(`\n[admin-invite] ${to} (${role}) invited by ${invitedBy}: ${link}\n`);
    return;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const roleLabel = role === 'admin' ? 'a full Admin (can manage bookings and other admins)' : 'a Viewer (read-only booking access)';
  const html = shell(
    title,
    `<p style="margin:0 0 12px">${invitedBy} has invited you to join Tender Child Care as ${roleLabel}.</p>
     <p style="margin:0 0 18px">Click below to set your password and sign in. This invite expires in 48 hours.</p>
     <p><a href="${link}" style="display:inline-block;background:${brand};color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">Accept invite</a></p>
     <p style="margin:18px 0 0;color:#6b647a;font-size:12px">Or copy this link into your browser:<br/><span style="word-break:break-all">${link}</span></p>`
  );
  await t.sendMail({ from, to, subject: title, html });
}

export async function sendStatusUpdateEmail(
  b: Booking,
  status: 'confirmed' | 'cancelled' | 'completed'
) {
  const t = getTransporter();
  if (!t || !b.email) return;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const titles = {
    confirmed: 'Your booking is confirmed! ✅',
    cancelled: 'Your booking has been cancelled',
    completed: 'Thanks for booking with us',
  };
  const intros = {
    confirmed:
      'Great news — your consultation is confirmed. We look forward to seeing you. Details below:',
    cancelled:
      "Your booking has been cancelled. If this wasn't expected, just reply and we'll sort it out.",
    completed: 'Thanks for joining us! We hope it was helpful. Want to book another session?',
  };
  const html = shell(
    titles[status],
    `<p style="margin:0 0 12px">Hi ${b.name.split(' ')[0]},</p>
     <p style="margin:0 0 12px">${intros[status]}</p>
     ${bookingRows(b)}`
  );
  await t.sendMail({ from, to: b.email, subject: titles[status], html });
}
