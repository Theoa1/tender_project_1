import Link from 'next/link';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Avatar,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import SchoolIcon from '@mui/icons-material/School';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

export const metadata = { title: 'Services' };
export const dynamic = 'force-static';
export const revalidate = 3600;

const services = [
  {
    icon: <SupportAgentIcon />,
    title: 'Parenting Consultations (1-on-1)',
    desc: 'A focused session to talk through what\u2019s happening and leave with a clear, doable plan.',
  },
  {
    icon: <ChildCareIcon />,
    title: 'Child Behavior Guidance',
    desc: 'Tantrums, defiance, big emotions — strategies that protect your bond while setting limits.',
  },
  {
    icon: <NightsStayIcon />,
    title: 'Routine Building',
    desc: 'Sleep, meals, transitions, and a predictable daily rhythm the whole family can follow.',
  },
  {
    icon: <EmojiPeopleIcon />,
    title: 'Toddler & Preschool Support',
    desc: 'Developmentally appropriate guidance for the ages that test every parent.',
  },
  {
    icon: <FavoriteIcon />,
    title: 'New Parent Coaching',
    desc: 'Feeding, sleep, soothing — confidence for the first weeks and months.',
  },
  {
    icon: <SchoolIcon />,
    title: 'Virtual or Phone Sessions',
    desc: 'Meet from anywhere. No travel, no childcare — just real support when you need it.',
  },
];

export default function ServicesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1} textAlign={{ md: 'center' }} sx={{ mb: 6 }}>
        <Chip label="Services" color="primary" variant="outlined" />
        <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 52 } }}>
          Support, built around your family
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 640 }}>
          Choose the kind of help that fits your week. Every session is private, practical, and
          tailored.
        </Typography>
      </Stack>
      <Grid container spacing={3}>
        {services.map((s) => (
          <Grid item xs={12} sm={6} md={4} key={s.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3.5 }}>
                <Avatar
                  sx={{ mb: 2, background: 'linear-gradient(135deg,#7B5BC5,#3FC1B0)' }}
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
      <Stack alignItems="center" sx={{ mt: 8 }}>
        <Button
          component={Link}
          href="/contact"
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
        >
          Book a Consultation
        </Button>
      </Stack>
    </Container>
  );
}
