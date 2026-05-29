import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Box,
} from '@mui/material';

export const metadata = { title: 'Resources & Tips' };
export const dynamic = 'force-static';
export const revalidate = 3600;

const tips = [
  {
    tag: 'Behavior',
    title: 'How to handle tantrums (without losing your cool)',
    body: 'Tantrums are a sign of an overwhelmed nervous system, not bad behavior. Lower your voice, get on their level, name the feeling ("you really wanted that cookie"), and wait it out. Save the lesson for after the storm passes.',
  },
  {
    tag: 'Sleep',
    title: 'Creating a bedtime routine that actually works',
    body: 'Keep it short (20–30 min), the same order every night, and end in their room. Bath → PJs → 2 books → song → lights out. Predictability is the magic — not perfection.',
  },
  {
    tag: 'Discipline',
    title: 'Positive discipline basics',
    body: 'Set the limit kindly and firmly. Acknowledge the feeling, hold the boundary. "I won\u2019t let you hit. You\u2019re mad — let\u2019s stomp instead." Connection first, correction second.',
  },
  {
    tag: 'Development',
    title: 'Signs of developmental delays to watch for',
    body: 'Trust your gut. If your child isn\u2019t meeting major milestones (rolling, babbling, walking, single words, pointing), bring it up at your next pediatric visit. Early support is the most powerful kind.',
  },
  {
    tag: 'Routines',
    title: 'Building a daily rhythm toddlers can predict',
    body: 'Anchor the day with 3–4 fixed points: wake, lunch, nap, dinner, bath. The rest can flex. Kids relax into days they can predict.',
  },
  {
    tag: 'New parents',
    title: 'Surviving the first 90 days',
    body: 'Lower the bar. Eat. Sleep when you can. Accept help. The newborn phase isn\u2019t forever — and you\u2019re doing better than you think.',
  },
];

export default function ResourcesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1} textAlign={{ md: 'center' }} sx={{ mb: 6 }}>
        <Chip label="Tips & Resources" color="secondary" variant="outlined" />
        <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 52 } }}>
          Quick reads for real parenting moments
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 640 }}>
          Bookmark these for the next tough day. Practical, gentle, and grounded in child
          development.
        </Typography>
      </Stack>
      <Grid container spacing={3}>
        {tips.map((t) => (
          <Grid item xs={12} md={6} key={t.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3.5 }}>
                <Chip label={t.tag} color="primary" size="small" sx={{ mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 1.5 }}>
                  {t.title}
                </Typography>
                <Typography color="text.secondary">{t.body}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(123,91,197,0.10), rgba(63,193,176,0.10))',
          border: '1px solid rgba(123,91,197,0.15)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" sx={{ mb: 1 }}>
          Want help with your exact situation?
        </Typography>
        <Typography color="text.secondary">
          Book a 1-on-1 consultation and we&apos;ll build a plan for your family.
        </Typography>
      </Box>
    </Container>
  );
}
