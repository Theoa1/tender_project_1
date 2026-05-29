import Link from 'next/link';
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import SchoolIcon from '@mui/icons-material/School';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

export const dynamic = 'force-static';
export const revalidate = 3600;

const services = [
  { icon: <ChildCareIcon />, title: 'Child behavior guidance', desc: 'Calm, consistent strategies that work in real life.' },
  { icon: <NightsStayIcon />, title: 'Sleep & routine coaching', desc: 'Bedtime, naps, and predictable daily structure.' },
  { icon: <EmojiPeopleIcon />, title: 'Toddler tantrums', desc: 'Positive discipline that protects your bond.' },
  { icon: <SchoolIcon />, title: 'Early childhood development', desc: 'Age-appropriate milestones and support.' },
  { icon: <FavoriteIcon />, title: 'New parent coaching', desc: 'Confidence for the first weeks and months.' },
  { icon: <SupportAgentIcon />, title: '1-on-1 consultations', desc: 'Virtual or phone — fits your schedule.' },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(1200px 600px at 10% -10%, rgba(123,91,197,0.18), transparent 60%), radial-gradient(800px 500px at 100% 0%, rgba(63,193,176,0.18), transparent 60%), linear-gradient(180deg, #FBFAFE 0%, #ffffff 100%)',
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="Now booking — virtual & phone sessions"
                color="secondary"
                size="small"
                sx={{ mb: 2, fontWeight: 600 }}
              />
              <Typography
                variant="h1"
                sx={{ fontSize: { xs: 40, md: 64 }, lineHeight: 1.05, mb: 2 }}
              >
                Tender Loving{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg,#7B5BC5,#3FC1B0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Parenting Support
                </Box>
              </Typography>
              <Typography
                sx={{ fontSize: { xs: 17, md: 20 }, color: 'text.secondary', mb: 4, maxWidth: 620 }}
              >
                Helping parents build confidence, structure, and peace in everyday childcare. Real
                guidance from a licensed childcare provider who&apos;s been in the trenches with you.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={Link}
                  href="/contact"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                >
                  Book a Consultation
                </Button>
                <Button
                  component={Link}
                  href="/services"
                  variant="outlined"
                  size="large"
                  color="primary"
                >
                  Get Parenting Help Today
                </Button>
              </Stack>
              <Stack direction="row" spacing={3} sx={{ mt: 5, color: 'text.secondary' }} flexWrap="wrap" useFlexGap>
                {['Licensed provider', 'Practical & realistic', 'Judgment-free'].map((t) => (
                  <Stack key={t} direction="row" spacing={1} alignItems="center">
                    <CheckCircleRoundedIcon color="secondary" fontSize="small" />
                    <Typography variant="body2">{t}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 6,
                  overflow: 'hidden',
                  p: { xs: 3, md: 4 },
                  background: 'linear-gradient(135deg, rgba(123,91,197,0.10), rgba(63,193,176,0.10))',
                  border: '1px solid rgba(123,91,197,0.15)',
                }}
              >
                <Stack spacing={2}>
                  {[
                    { name: 'Aisha', text: '“My toddler\u2019s tantrums dropped within a week.”' },
                    { name: 'Marcus', text: '“Finally a bedtime routine that actually sticks.”' },
                    { name: 'Priya', text: '“Real advice, no judgment. So grateful.”' },
                  ].map((q) => (
                    <Card key={q.name} sx={{ p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.light' }}>{q.name[0]}</Avatar>
                        <Box>
                          <Typography fontWeight={700}>{q.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {q.text}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SERVICES */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 6, textAlign: 'center' }}>
          <Chip label="What we help with" color="primary" variant="outlined" />
          <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 } }}>
            Support for every parenting season
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 640 }}>
            From newborn nights to toddler tantrums and big kid routines — we&apos;ll meet you where
            you are.
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {services.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.title}>
              <Card sx={{ height: '100%', transition: 'transform .2s ease, box-shadow .2s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 14px 36px rgba(60,40,120,0.10)' } }}>
                <CardContent>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48,
                      mb: 2,
                      background: 'linear-gradient(135deg,#7B5BC5,#3FC1B0)',
                    }}
                  >
                    {s.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {s.title}
                  </Typography>
                  <Typography color="text.secondary">{s.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* TRUST BAND */}
      <Box sx={{ bgcolor: '#faf8ff', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Stack alignItems="center" textAlign="center" spacing={2}>
            <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 36 } }}>
              You don&apos;t have to figure it out alone.
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 620 }}>
              With real experience in licensed childcare, we understand what children need and what
              parents go through every day. Our advice is practical, realistic, and easy to apply at
              home.
            </Typography>
            <Button
              component={Link}
              href="/contact"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ mt: 2 }}
            >
              Schedule a consultation
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* PRICING */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 6, textAlign: 'center' }}>
          <Chip label="Simple pricing" color="secondary" variant="outlined" />
          <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 44 } }}>
            Pick the support that fits
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {[
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
          ].map((p) => (
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
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="overline" color="text.secondary">
                    {p.name}
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1} sx={{ my: 1 }}>
                    <Typography variant="h3" sx={{ fontSize: 40 }}>
                      {p.price}
                    </Typography>
                    <Typography color="text.secondary">/ {p.time}</Typography>
                  </Stack>
                  <Stack spacing={1.2} sx={{ my: 3 }}>
                    {p.features.map((f) => (
                      <Stack direction="row" spacing={1} key={f} alignItems="center">
                        <CheckCircleRoundedIcon color="secondary" fontSize="small" />
                        <Typography>{f}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button
                    component={Link}
                    href={`/contact?service=${encodeURIComponent(p.name)}#book`}
                    fullWidth
                    variant={p.featured ? 'contained' : 'outlined'}
                  >
                    Book {p.name}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
