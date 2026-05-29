'use client';
import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch('/api/account/logout', { method: 'POST' });
    router.push('/account/login');
    router.refresh();
  }
  return (
    <Button startIcon={<LogoutIcon />} onClick={logout} color="inherit">
      Sign out
    </Button>
  );
}
