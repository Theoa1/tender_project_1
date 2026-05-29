import { Container, Skeleton, Grid, Stack } from '@mui/material';

export default function Loading() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Skeleton variant="text" width={220} height={50} />
      <Skeleton variant="text" width={320} height={28} sx={{ mb: 4 }} />
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={120} height={36} />
        ))}
      </Stack>
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid item xs={12} md={6} lg={4} key={i}>
            <Skeleton variant="rounded" height={220} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
