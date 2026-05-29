import { Suspense } from 'react';
import {
  Container,
  Grid,
  Typography,
  Chip,
  Stack,
  Box,
  Card,
  CardContent,
  Button,
  Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BookingForm from '@/components/BookingForm';

export const metadata = { title: 'Book a Consultation' };

const PLANS = [
  {
    name: '30-min Quick Chat',
    price: '$30–$50',
    time: '30 minutes',
    features: ['One focused topic', 'Action plan you can use tonight', 'Email recap'],
  },
  {
    name: '60-min Full Consultation',
    price: '$60–$100',
    time: '60 minutes',
    features: ['Deep dive on your situation', 'Custom step-by-step plan', '7-day follow-up check-in'],
    featured: true,
  },
  {
    name: 'Monthly Support Plan',
    price: '$150–$300',
    time: 'per month',
    features: ['2 sessions / month', 'Text support between sessions', 'Priority booking'],
  },
];

export default function ContactPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
      {/* HEADER */}
      <Stack alignItems="center" spacing={1} sx={{ mb: 5, textAlign: 'center' }}>
        <Chip label="Book a consultation" color="primary" variant="outlined" />
        <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 48 } }}>
          Let&apos;s talk.
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 640, fontSize: 18 }}>
          Pick a time that works for you. You&apos;ll get a confirmation by email or text right
          away.
        </Typography>
      </Stack>

      {/* BOOKING FORM */}
      <Box id="book" sx={{ scrollMarginTop: 96, mb: { xs: 8, md: 10 } }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={5}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'primary.main', color: '#fff', display: 'inline-flex' }}>
                  <EmailIcon />
                </Box>
                <Box>
                  <Typography fontWeight={700}>Email</Typography>
                  <Typography color="text.secondary">hello@tenderchildcare.com</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'secondary.main', color: '#fff', display: 'inline-flex' }}>
                  <PhoneIcon />
                </Box>
                <Box>
                  <Typography fontWeight={700}>Phone / text</Typography>
                  <Typography color="text.secondary">(555) 123-4567</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'info.main', color: '#fff', display: 'inline-flex' }}>
                  <ScheduleIcon />
                </Box>
                <Box>
                  <Typography fontWeight={700}>Hours</Typography>
                  <Typography color="text.secondary">Mon–Sat · 9am – 7pm</Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={7}>
            <Suspense fallback={null}>
              <BookingForm />
            </Suspense>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: { xs: 8, md: 10 } }} />

      {/* PLANS & PRICING */}
      <Stack alignItems="center" spacing={1} sx={{ mb: 5, textAlign: 'center' }}>
        <Chip label="Plans & pricing" color="secondary" variant="outlined" />
        <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 36 } }}>
          Pick the support that fits your family
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 620 }}>
          Pricing is a range so we can meet you where you are. Final price is confirmed when we
          chat — no surprises.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {PLANS.map((p) => (
          <Grid item xs={12} md={4} key={p.name}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                ...(p.featured && {
                  border: '2px solid',
                  borderColor: 'primary.main',
                  transform: { md: 'scale(1.03)' },
                }),
              }}
            >
              {p.featured && (
                <Chip
                  label="Most popular"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                />
              )}
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="overline" color="text.secondary">
                  {p.name}
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ my: 1 }}>
                  <Typography variant="h3" sx={{ fontSize: 36 }}>
                    {p.price}
                  </Typography>
                  <Typography color="text.secondary">/ {p.time}</Typography>
                </Stack>
                <Stack spacing={1.2} sx={{ my: 3, flexGrow: 1 }}>
                  {p.features.map((f) => (
                    <Stack direction="row" spacing={1} key={f} alignItems="center">
                      <CheckCircleRoundedIcon color="secondary" fontSize="small" />
                      <Typography>{f}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Button
                  href={`/contact?service=${encodeURIComponent(p.name)}#book`}
                  fullWidth
                  variant={p.featured ? 'contained' : 'outlined'}
                  size="large"
                >
                  Book {p.name}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
