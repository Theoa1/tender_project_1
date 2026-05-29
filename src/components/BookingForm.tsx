'use client';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import SmsIcon from '@mui/icons-material/Sms';
import CodeInput from './CodeInput';
import { friendlyError } from '@/lib/friendly';

const SERVICES = [
  '30-min Quick Chat',
  '60-min Full Consultation',
  'Monthly Support Plan',
  'Sleep & Routine Coaching',
  'Behavior Guidance',
  'New Parent Coaching',
];

const TIMES = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '6:00 PM',
  '7:00 PM',
];

type Step = 'details' | 'verify' | 'success';

export default function BookingForm() {
  const searchParams = useSearchParams();
  const initialService = React.useMemo(() => {
    const q = searchParams?.get('service');
    return q && SERVICES.includes(q) ? q : SERVICES[1];
  }, [searchParams]);

  const [step, setStep] = React.useState<Step>('details');
  const [submitting, setSubmitting] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [resendIn, setResendIn] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    service: initialService,
    preferredDate: '',
    preferredTime: TIMES[0],
    message: '',
  });
  const [emailCode, setEmailCode] = React.useState('');
  const [phoneCode, setPhoneCode] = React.useState('');

  const today = new Date().toISOString().slice(0, 10);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  // Keep service in sync when the user clicks a plan card (?service=...)
  React.useEffect(() => {
    const q = searchParams?.get('service');
    if (q && SERVICES.includes(q)) {
      setForm((f) => (f.service === q ? f : { ...f, service: q }));
    }
  }, [searchParams]);

  async function sendCodes() {
    setError(null);
    setInfo(null);
    setSending(true);
    try {
      const payload: Record<string, unknown> = { purpose: 'booking' };
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      const res = await fetch('/api/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Could not send codes.');
      const sent: { email?: string; phone?: string } = data.status || {};
      const expectedEmail = !!form.email.trim();
      const expectedPhone = !!form.phone.trim();
      const emailOk = !expectedEmail || sent.email === 'sent';
      const phoneOk = !expectedPhone || sent.phone === 'sent';
      if (!emailOk || !phoneOk) {
        const warn: string[] = [];
        if (expectedEmail && sent.email !== 'sent') warn.push('email');
        if (expectedPhone && sent.phone !== 'sent') warn.push('SMS');
        setInfo(
          `We couldn't send the ${warn.join(' & ')} code(s). Double-check your ${warn.join(' / ')} and try again.`
        );
      } else {
        const channels = [expectedEmail && 'email', expectedPhone && 'phone']
          .filter(Boolean)
          .join(' and ');
        setInfo(`Code sent! Check your ${channels}.`);
      }
      setStep('verify');
      setResendIn(30);
    } catch (e: unknown) {
      setError(friendlyError(e, 'We couldn’t send your code right now. Please try again.'));
    } finally {
      setSending(false);
    }
  }

  function validateDetails(): string | null {
    if (form.name.trim().length < 2) return 'Please enter your name.';
    const hasEmail = form.email.trim().length > 0;
    const hasPhone = form.phone.replace(/\D/g, '').length >= 7;
    if (!hasEmail && !hasPhone) return 'Please enter your email or phone number.';
    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.';
    if (form.phone.trim().length > 0 && !hasPhone) return 'Please enter a valid phone number.';
    if (!form.preferredDate) return 'Please pick a preferred date.';
    return null;
  }

  async function onSubmitDetails(e: React.FormEvent) {
    e.preventDefault();
    const v = validateDetails();
    if (v) {
      setError(v);
      return;
    }
    await sendCodes();
  }

  async function onSubmitVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const needEmail = !!form.email.trim();
    const needPhone = !!form.phone.trim();
    if (needEmail && emailCode.length !== 6) {
      setError('Enter the 6-digit email code.');
      return;
    }
    if (needPhone && phoneCode.length !== 6) {
      setError('Enter the 6-digit phone code.');
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        service: form.service,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        message: form.message,
      };
      if (needEmail) {
        body.email = form.email;
        body.emailCode = emailCode;
      }
      if (needPhone) {
        body.phone = form.phone;
        body.phoneCode = phoneCode;
      }
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Could not complete booking.');
      setStep('success');
    } catch (e: unknown) {
      setError(friendlyError(e, 'We hit a snag confirming your booking. Please try again in a moment.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'success') {
    return (
      <Card>
        <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <CheckCircleRoundedIcon color="secondary" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 1 }}>
            You&apos;re booked!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            We&apos;ve sent you a confirmation. We&apos;ll reach out shortly to lock in the time.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => {
                setForm((f) => ({ ...f, message: '' }));
                setEmailCode('');
                setPhoneCode('');
                setStep('details');
                setError(null);
                setInfo(null);
              }}
            >
              Book another
            </Button>
            <Button variant="contained" href="/account/login">
              View my bookings
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, md: 5 } }}>
        <Stepper activeStep={step === 'details' ? 0 : 1} alternativeLabel sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Your details</StepLabel>
          </Step>
          <Step>
            <StepLabel>Verify & confirm</StepLabel>
          </Step>
        </Stepper>

        {step === 'details' ? (
          <Box component="form" onSubmit={onSubmitDetails} noValidate>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Book a consultation
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Tell us about your booking — give us your email or phone (or both) and we'll send a code to verify.
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField label="Your name" required value={form.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email (optional if phone given)" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone (optional if email given)"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  autoComplete="tel"
                  placeholder="+1 555 123 4567"
                  helperText="Include country code for SMS verification."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Service" value={form.service} onChange={(e) => update('service', e.target.value)}>
                  {SERVICES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred date"
                  type="date"
                  required
                  value={form.preferredDate}
                  onChange={(e) => update('preferredDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Preferred time" value={form.preferredTime} onChange={(e) => update('preferredTime', e.target.value)}>
                  {TIMES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Tell us a bit (optional)"
                  multiline
                  minRows={4}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  placeholder="What's going on? Ages of kids? Anything we should know?"
                />
              </Grid>
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={sending}
                    startIcon={sending ? <CircularProgress size={18} color="inherit" /> : null}
                  >
                    {sending ? 'Sending codes…' : 'Continue'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box component="form" onSubmit={onSubmitVerify} noValidate>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Verify it&apos;s you
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              We just sent a 6-digit code. Enter it below to confirm your booking.
            </Typography>

            {info && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {info}
              </Alert>
            )}

            <Stack spacing={3}>
              {form.email.trim() && (
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <MarkEmailReadIcon color="primary" fontSize="small" />
                    <Typography fontWeight={600}>Email code</Typography>
                    <Typography color="text.secondary" sx={{ ml: 1, fontSize: 14 }}>
                      sent to {form.email}
                    </Typography>
                  </Stack>
                  <CodeInput value={emailCode} onChange={setEmailCode} autoFocus ariaLabel="Email verification code" />
                </Box>
              )}
              {form.email.trim() && form.phone.trim() && <Divider />}
              {form.phone.trim() && (
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <SmsIcon color="secondary" fontSize="small" />
                    <Typography fontWeight={600}>Phone code</Typography>
                    <Typography color="text.secondary" sx={{ ml: 1, fontSize: 14 }}>
                      sent to {form.phone}
                    </Typography>
                  </Stack>
                  <CodeInput
                    value={phoneCode}
                    onChange={setPhoneCode}
                    autoFocus={!form.email.trim()}
                    ariaLabel="Phone verification code"
                  />
                </Box>
              )}

              {error && <Alert severity="error">{error}</Alert>}

              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setStep('details')} disabled={submitting}>
                  Back
                </Button>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Button
                    onClick={sendCodes}
                    disabled={sending || resendIn > 0}
                    size="small"
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : sending ? 'Sending…' : 'Resend codes'}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={
                      submitting ||
                      (!!form.email.trim() && emailCode.length !== 6) ||
                      (!!form.phone.trim() && phoneCode.length !== 6)
                    }
                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                  >
                    {submitting ? 'Confirming…' : 'Confirm booking'}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
