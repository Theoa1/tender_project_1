'use client';
import * as React from 'react';
import { Box, Button, Container, Typography, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack spacing={3} alignItems="center" textAlign="center">
        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            We hit a little bump
          </Typography>
          <Typography color="text.secondary">
            Sorry — that&rsquo;s on us. Please try again, and if it keeps happening you can head back home or reach out.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="outlined" href="/">
            Go home
          </Button>
        </Stack>
        {error.digest && (
          <Typography variant="caption" color="text.disabled">
            Reference: {error.digest}
          </Typography>
        )}
      </Stack>
    </Container>
  );
}
