'use client';
import { createTheme } from '@mui/material/styles';

// Brand palette pulled from logo: purple, teal, sky blue
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#7B5BC5', light: '#A98BE0', dark: '#5A3FA0', contrastText: '#fff' },
    secondary: { main: '#3FC1B0', light: '#74D8CB', dark: '#2A8E81', contrastText: '#fff' },
    info: { main: '#5BA8E0' },
    background: { default: '#FBFAFE', paper: '#ffffff' },
    text: { primary: '#1F1B2E', secondary: '#5A5468' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 22, paddingBlock: 10 },
        containedPrimary: {
          boxShadow: '0 8px 20px rgba(123,91,197,0.28)',
          '&:hover': { boxShadow: '0 10px 24px rgba(123,91,197,0.35)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 6px 24px rgba(60,40,120,0.06)',
          border: '1px solid rgba(123,91,197,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'saturate(180%) blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.85)',
          color: '#1F1B2E',
          boxShadow: '0 1px 0 rgba(123,91,197,0.08)',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
  },
});
