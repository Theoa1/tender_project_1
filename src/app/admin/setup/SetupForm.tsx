'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { friendlyError } from '@/lib/friendly';

export default function SetupForm({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [email, setEmail] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<string>('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admins/setup?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Invite is invalid.');
        if (!cancelled) {
          setEmail(data.email);
          setRole(data.role);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(friendlyError(e, 'This invite link is invalid or expired.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admins/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Could not complete setup.');
      router.push('/admin');
    } catch (e: unknown) {
      setError(friendlyError(e, 'We couldn’t finish setting up your account. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!email) {
    return <Alert severity="error">{error || 'Invite is invalid.'}</Alert>;
  }

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Setting up account for <strong>{email}</strong> ({role})
        </Typography>
        <TextField
          type="password"
          label="New password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText="At least 8 characters."
        />
        <TextField
          type="password"
          label="Confirm password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {submitting ? 'Saving…' : 'Set password & sign in'}
        </Button>
      </Stack>
    </Box>
  );
}
