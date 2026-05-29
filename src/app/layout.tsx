import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ThemeRegistry from '@/components/ThemeRegistry';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'Tender Child Care — Tender Loving Parenting Support',
    template: '%s · Tender Child Care',
  },
  description:
    'Helping parents build confidence, structure, and peace in everyday childcare. Book a 1-on-1 parenting consultation today.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Tender Loving Parenting Support',
    description:
      'Practical parenting help you can trust — behavior, routines, sleep, and early childhood support.',
    images: ['/logo.png'],
    type: 'website',
  },
  icons: { icon: '/logo.png' },
};

export const viewport: Viewport = {
  themeColor: '#7B5BC5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ margin: 0, fontFamily: 'var(--font-inter), -apple-system, Segoe UI, Roboto, sans-serif' }}>
        <ThemeRegistry>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
