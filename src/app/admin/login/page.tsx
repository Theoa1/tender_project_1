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
} from '@mui/material';
import Logo from '@/components/Logo';
import { friendlyError } from '@/lib/friendly';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/admin';
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Login failed');
      router.push(next);
      router.refresh();
    } catch (err: unknown) {
      setError(friendlyError(err, 'We couldn’t sign you in. Please double-check your email and password.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack alignItems="center" spacing={3}>
        <Logo height={48} />
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Owner login
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Sign in to view and manage bookings.
            </Typography>
            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" variant="contained" size="large" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
