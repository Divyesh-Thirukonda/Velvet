import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shopify 3D | Klaviyo Integration',
  description: 'Generate 3D models for your Shopify store and retarget with Klaviyo.',
};

import { cookies } from 'next/headers';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const domainCookie = cookieStore.get('shopify_domain')?.value?.trim();
  const tokenCookie = cookieStore.get('shopify_token')?.value?.trim();
  const isConnected = Boolean(domainCookie && tokenCookie);

  return (
    <html lang="en">
      <head>
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
      </head>
      <body className={outfit.className}>
        <Navbar isConnected={isConnected} />
        <main className="min-h-screen relative overflow-hidden">
          {/* Background Ambient Glows */}
          <div className="container py-4">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
