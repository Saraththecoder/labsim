import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AR Physics Lab: Refraction Through a Convex Lens',
  description:
    'An interactive 3D virtual optics bench and WebXR Augmented Reality physics laboratory for investigating refraction, real & virtual image formation, focal length measurement, and ray tracing.',
  keywords: [
    'Convex Lens',
    'Physics Virtual Lab',
    'WebXR Augmented Reality',
    'Refraction of Light',
    'Optical Bench',
    'Focal Length',
    'Lens Formula',
    'Ray Optics',
  ],
  authors: [{ name: 'OptiLab Physics Team' }],
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
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#070b14] text-slate-100 selection:bg-cyan-500 selection:text-black">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
