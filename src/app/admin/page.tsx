import { Container, Typography, Box } from '@mui/material';
import { prisma } from '@/lib/prisma';
import { getOwnerSession } from '@/lib/auth';
import { ensureSeed } from '@/lib/settings';
import AdminDashboard from './AdminDashboard';

export const metadata = { title: 'Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await ensureSeed();
  const session = await getOwnerSession();
  let serializable: Array<Record<string, unknown>> = [];
  let dbError: string | null = null;
  try {
    const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
    serializable = bookings.map((b) => ({
      ...b,
      preferredDate: b.preferredDate.toISOString(),
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));
  } catch (e) {
    console.error('admin: load bookings failed', e);
    dbError = 'Could not connect to the database. Check DATABASE_URL and try again.';
  }
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          {session ? `Signed in as ${session.email} (${session.role})` : 'Manage incoming consultation requests in one place.'}
        </Typography>
      </Box>
      {dbError ? (
        <Box sx={{ p: 4, borderRadius: 2, bgcolor: '#fff5f5', color: 'error.main' }}>
          {dbError}
        </Box>
      ) : (
        <AdminDashboard
          initialBookings={serializable as never}
          me={session ? { id: session.sub, email: session.email, role: session.role } : null}
        />
      )}
    </Container>
  );
}
