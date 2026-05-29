import { Container, Typography, Box, Grid, Card, CardContent, Avatar, Stack, Chip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VerifiedIcon from '@mui/icons-material/Verified';
import PsychologyIcon from '@mui/icons-material/Psychology';

export const metadata = { title: 'About' };
export const dynamic = 'force-static';
export const revalidate = 3600;

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
      <Chip label="About" color="primary" variant="outlined" sx={{ mb: 2 }} />
      <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 52 }, mb: 3 }}>
        Real experience. Real support.
      </Typography>
      <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, mb: 5 }}>
        As a licensed childcare provider and experienced caregiver, I have worked closely with
        children across different developmental stages. I understand the daily challenges parents
        face and provide real, practical solutions based on hands-on experience.
      </Typography>

      <Grid container spacing={3} sx={{ my: 4 }}>
        {[
          { icon: <VerifiedIcon />, title: 'Licensed provider', desc: 'Trained and trusted in early childhood care.' },
          { icon: <PsychologyIcon />, title: 'Behavior-informed', desc: 'Strategies rooted in child development.' },
          { icon: <FavoriteIcon />, title: 'Judgment-free', desc: 'Warm, supportive guidance — no shame, ever.' },
        ].map((b) => (
          <Grid item xs={12} sm={4} key={b.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Avatar
                  sx={{
                    mb: 2,
                    background: 'linear-gradient(135deg,#7B5BC5,#3FC1B0)',
                  }}
                >
                  {b.icon}
                </Avatar>
                <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                  {b.title}
                </Typography>
                <Typography color="text.secondary">{b.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Our promise to you
        </Typography>
        <Stack spacing={2} sx={{ color: 'text.secondary', fontSize: 17 }}>
          <Typography>
            Parenting can feel overwhelming — especially when nothing seems to be working. We&apos;re
            here to take the guesswork out of it. Together we&apos;ll look at what&apos;s really
            going on, what your child needs at this stage, and what small changes will make the
            biggest difference.
          </Typography>
          <Typography>
            Every plan we build is tailored to your family — your schedule, your values, and the
            child in front of you.
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
