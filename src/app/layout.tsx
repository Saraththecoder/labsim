import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Sora } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SplashScreen } from '@/components/SplashScreen';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LabSim: Virtual Science Laboratory',
  description:
    'An interactive 3D and WebXR Augmented Reality virtual science laboratory for investigating physics optics and chemistry experiments.',
  manifest: '/manifest.json',
  keywords: [
    'LabSim',
    'Virtual Science Lab',
    'WebXR Augmented Reality',
    'Convex Lens',
    'Refraction of Light',
    'Optical Bench',
    'Physics Virtual Lab',
    'Chemistry Virtual Lab',
  ],
  authors: [{ name: 'LabSim Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${instrumentSerif.variable} ${sora.variable}`}
    >
      <body className="min-h-full flex flex-col text-[#17231B] font-sans selection:bg-[#B8D96B] selection:text-[#17231B] pb-16 md:pb-0">
        <SplashScreen />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
