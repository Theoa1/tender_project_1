import { redirect } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getClientSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LogoutButton from './LogoutButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My bookings' };

const COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'error',
};

export default async function AccountPage() {
  const session = await getClientSession();
  if (!session) redirect('/account/login');

  type BookingRow = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    service: string;
    preferredDate: Date;
    preferredTime: string;
    message: string | null;
    status: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  let bookings: BookingRow[] = [];
  let dbError: string | null = null;
  try {
    bookings = (await prisma.booking.findMany({
      where: { email: session.email },
      orderBy: { preferredDate: 'desc' },
    })) as BookingRow[];
  } catch (e) {
    console.error('account: load bookings failed', e);
    dbError = 'Could not load your bookings right now. Please try again shortly.';
  }

  const now = Date.now();
  const upcoming = bookings.filter(
    (b: BookingRow) => new Date(b.preferredDate).getTime() >= now - 24 * 3600_000 && b.status !== 'cancelled'
  );
  const past = bookings.filter((b: BookingRow) => !upcoming.includes(b));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h3" sx={{ mb: 0.5 }}>
            My bookings
          </Typography>
          <Typography color="text.secondary">Signed in as {session.email}</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" href="/contact">
            Book another
          </Button>
          <LogoutButton />
        </Stack>
      </Stack>

      {dbError ? (
        <Box sx={{ p: 4, borderRadius: 2, bgcolor: '#fff5f5', color: 'error.main' }}>
          {dbError}
        </Box>
      ) : (
        <>
          <Section title="Upcoming" bookings={upcoming} emptyText="No upcoming bookings." colors={COLORS} />
          <Box sx={{ height: 32 }} />
          <Section title="Past" bookings={past} emptyText="Nothing here yet." colors={COLORS} />
        </>
      )}
    </Container>
  );
}

type B = Awaited<ReturnType<typeof prisma.booking.findMany>>[number];

function Section({
  title,
  bookings,
  emptyText,
  colors,
}: {
  title: string;
  bookings: B[];
  emptyText: string;
  colors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'>;
}) {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {bookings.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">{emptyText}</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {bookings.map((b) => (
            <Grid item xs={12} md={6} key={b.id}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {b.service}
                    </Typography>
                    <Chip label={b.status} color={colors[b.status] || 'default'} size="small" />
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', mb: 1 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <EventIcon fontSize="small" />
                      <span>
                        {new Date(b.preferredDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <AccessTimeIcon fontSize="small" />
                      <span>{b.preferredTime}</span>
                    </Stack>
                  </Stack>
                  {b.message && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                        {b.message}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
