'use client';
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import Logo from '@/components/Logo';
import CodeInput from '@/components/CodeInput';
import { friendlyError } from '@/lib/friendly';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type Step = 'email' | 'code';

export default function ClientLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/account';
  const [step, setStep] = React.useState<Step>('email');
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendIn, setResendIn] = React.useState(0);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  async function sendCode() {
    setError(null);
    setSending(true);
    try {
      const res = await fetch('/api/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'login' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Could not send code.');
      setStep('code');
      setResendIn(30);
    } catch (e: unknown) {
      setError(friendlyError(e, 'We couldn’t send your code. Please check your email and try again.'));
    } finally {
      setSending(false);
    }
  }

  async function verifyAndLogin() {
    setError(null);
    setVerifying(true);
    try {
      const res = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Sign-in failed.');
      router.push(next);
      router.refresh();
    } catch (e: unknown) {
      setError(friendlyError(e, 'That code didn’t work. Please request a new one and try again.'));
    } finally {
      setVerifying(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack alignItems="center" spacing={3}>
        <Logo height={48} />
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            {step === 'email' ? (
              <Box
                component="form"
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) sendCode();
                  else setError('Please enter a valid email.');
                }}
              >
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Sign in to your account
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  We&apos;ll email you a 6-digit code — no password required.
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={sending}
                    startIcon={sending ? <CircularProgress size={18} color="inherit" /> : null}
                  >
                    {sending ? 'Sending…' : 'Send code'}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box
                component="form"
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  if (code.length === 6) verifyAndLogin();
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <MarkEmailReadIcon color="primary" />
                  <Typography variant="h5">Enter your code</Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  We sent a 6-digit code to <b>{email}</b>.
                </Typography>
                <Stack spacing={3}>
                  <CodeInput value={code} onChange={setCode} autoFocus ariaLabel="Sign-in code" />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Button startIcon={<ArrowBackIcon />} onClick={() => setStep('email')}>
                      Use a different email
                    </Button>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Button onClick={sendCode} disabled={sending || resendIn > 0} size="small">
                        {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend'}
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={verifying || code.length !== 6}
                        startIcon={verifying ? <CircularProgress size={18} color="inherit" /> : null}
                      >
                        {verifying ? 'Signing in…' : 'Sign in'}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
