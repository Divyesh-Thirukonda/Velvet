import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shopify 3D | Klaviyo Integration',
  description: 'Generate 3D models for your Shopify store and retarget with Klaviyo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Navbar />
        <main className="pt-24 min-h-screen relative overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="container py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
