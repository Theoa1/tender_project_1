import twilio from 'twilio';

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  // Accept either env var name; TWILIO_FROM is canonical.
  const from = process.env.TWILIO_FROM || process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return null;
  try {
    const client = twilio(sid, token, {
      // Time out the Twilio HTTP call so it can't hang a request.
      timeout: 8000,
      lazyLoading: true,
    });
    return { client, from };
  } catch (e) {
    console.error('twilio init failed', e);
    return null;
  }
}

export async function sendClientSms(phone: string, name: string) {
  const c = getClient();
  if (!c) return;
  try {
    await c.client.messages.create({
      from: c.from,
      to: phone,
      body: `Hi ${name.split(' ')[0]}, thanks for booking with Tender Child Care! We received your request and will confirm shortly. — Tender Loving Parenting Support`,
    });
  } catch (e) {
    console.error('SMS send failed', e);
  }
}

export async function sendVerificationSms(phone: string, code: string) {
  const c = getClient();
  if (!c) {
    console.log(`\n[verify-sms] code for ${phone}: ${code}\n`);
    return;
  }
  await c.client.messages.create({
    from: c.from,
    to: phone,
    body: `Your Tender Child Care verification code is ${code}. It expires in 10 minutes.`,
  });
}

export async function sendStatusUpdateSms(
  phone: string,
  name: string,
  status: 'confirmed' | 'cancelled' | 'completed',
  when: string
) {
  const c = getClient();
  if (!c) return;
  const first = name.split(' ')[0];
  const bodies = {
    confirmed: `Hi ${first}, your Tender Child Care consultation is CONFIRMED for ${when}. See you then!`,
    cancelled: `Hi ${first}, your Tender Child Care consultation for ${when} has been cancelled. Reply to reschedule.`,
    completed: `Thanks ${first} for joining us today! — Tender Child Care`,
  };
  try {
    await c.client.messages.create({ from: c.from, to: phone, body: bodies[status] });
  } catch (e) {
    console.error('SMS send failed', e);
  }
}
