import { Container, Skeleton, Stack, Grid } from '@mui/material';

export default function Loading() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Skeleton variant="text" width={200} height={48} />
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
