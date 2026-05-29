import * as React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import SetupForm from './SetupForm';

export const dynamic = 'force-dynamic';

export default function AdminSetupPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token || '';
  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Set your password
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Finish setting up your Tender Child Care admin account.
          </Typography>
          {token ? (
            <SetupForm token={token} />
          ) : (
            <Typography color="error">Missing invite token.</Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
