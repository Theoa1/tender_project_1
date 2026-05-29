import { Box, Button, Container, Typography, Stack } from '@mui/material';

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Typography variant="overline" color="primary" sx={{ letterSpacing: 3 }}>
          404
        </Typography>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Page not found
          </Typography>
          <Typography color="text.secondary">
            The page you&apos;re looking for moved or doesn&apos;t exist.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" href="/">
            Go home
          </Button>
          <Button variant="outlined" href="/contact">
            Book a consultation
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
