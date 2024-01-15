import { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import '@/app/ui/global.css';

import { inter } from '@/app/ui/fonts';

export const metadata: Metadata = {
  title: {
    template: '%s | Financial Control Dashboard',
    default: 'Financial Control Dashboard',
  },
  description: 'Financial data control CRM, built with Next js',
  metadataBase: new URL('https://fin-control.vercel.app/dashboard'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
      <SpeedInsights />
    </html>
  );
}
