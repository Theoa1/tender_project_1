import Image from 'next/image';
import Link from 'next/link';
import { Box } from '@mui/material';

export default function Logo({ height = 44 }: { height?: number }) {
  return (
    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
      <Box sx={{ position: 'relative', height, width: height * 3.2 }}>
        <Image
          src="/logo.png"
          alt="Tender Child Care — One Goal, One Passion"
          fill
          priority
          sizes="200px"
          style={{ objectFit: 'contain', objectPosition: 'left center' }}
        />
      </Box>
    </Link>
  );
}
