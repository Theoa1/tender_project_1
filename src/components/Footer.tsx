import Link from 'next/link';
import { Box, Container, Grid, Typography, Stack, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import Logo from './Logo';

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: 10, pt: 6, pb: 4, bgcolor: '#faf8ff' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Logo height={40} />
            <Typography sx={{ mt: 2, color: 'text.secondary', maxWidth: 360 }}>
              Tender Loving Parenting Support — practical, compassionate guidance for parents
              navigating everyday childcare.
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
              Explore
            </Typography>
            <Stack spacing={1}>
              <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link>
              <Link href="/services" style={{ color: 'inherit', textDecoration: 'none' }}>Services</Link>
              <Link href="/resources" style={{ color: 'inherit', textDecoration: 'none' }}>Resources</Link>
              <Link href="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Book</Link>
              <Link href="/account/login" style={{ color: 'inherit', textDecoration: 'none' }}>My bookings</Link>
            </Stack>
          </Grid>
          <Grid item xs={6} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
              Contact
            </Typography>
            <Stack spacing={1} sx={{ color: 'text.secondary' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon fontSize="small" /> <span>hello@tenderchildcare.com</span>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon fontSize="small" /> <span>(555) 123-4567</span>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ color: 'text.secondary', fontSize: 14 }}
        >
          <span>© {new Date().getFullYear()} Tender Child Care. All rights reserved.</span>
          <Link href="/admin/login" style={{ color: 'inherit', textDecoration: 'none' }}>
            Owner login
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
