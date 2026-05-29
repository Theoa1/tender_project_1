'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import Logo from './Logo';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/resources', label: 'Resources' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const pathname = usePathname();

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 72, gap: 2 }}>
          <Logo />
          <Box sx={{ flex: 1 }} />
          {isDesktop ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {NAV.map((n) => (
                <Button
                  key={n.href}
                  component={Link}
                  href={n.href}
                  color="inherit"
                  sx={{
                    px: 2,
                    color: pathname === n.href ? 'primary.main' : 'text.primary',
                    fontWeight: pathname === n.href ? 700 : 500,
                  }}
                >
                  {n.label}
                </Button>
              ))}
              <Button
                component={Link}
                href="/account/login"
                color="inherit"
                sx={{ px: 2, color: 'text.primary' }}
              >
                My bookings
              </Button>
              <Button
                component={Link}
                href="/contact"
                variant="contained"
                color="primary"
                sx={{ ml: 1 }}
              >
                Book a Consultation
              </Button>
            </Box>
          ) : (
            <IconButton onClick={() => setOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }} role="presentation" onClick={() => setOpen(false)}>
          <Box sx={{ px: 2, pb: 1 }}>
            <Logo height={36} />
          </Box>
          <List>
            {NAV.map((n) => (
              <ListItemButton key={n.href} component={Link} href={n.href}>
                <ListItemText
                  primary={n.label}
                  primaryTypographyProps={{
                    fontWeight: pathname === n.href ? 700 : 500,
                    color: pathname === n.href ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            ))}
            <ListItemButton component={Link} href="/account/login">
              <ListItemText primary="My bookings" />
            </ListItemButton>
            <Box sx={{ px: 2, pt: 2 }}>
              <Button fullWidth variant="contained" component={Link} href="/contact">
                Book a Consultation
              </Button>
            </Box>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
