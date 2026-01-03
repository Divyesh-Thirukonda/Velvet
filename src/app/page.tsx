import { getShopifyProducts, Product } from '@/lib/shopify';
import { fetchRealShopifyProducts } from '@/lib/shopify-real';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowRight, Box, Zap, Globe, CheckCircle2 } from 'lucide-react';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const shopifyDomain = cookieStore.get('shopify_domain')?.value;
  const shopifyToken = cookieStore.get('shopify_token')?.value;

  let products: Product[] = [];
  let isConnected = false;

  if (shopifyDomain && shopifyToken) {
    products = await fetchRealShopifyProducts(shopifyDomain, shopifyToken);
    isConnected = true;
    if (products.length === 0) {
      // Fallback if token invalid
      products = await getShopifyProducts();
      isConnected = false;
    }
  } else {
    products = await getShopifyProducts();
  }

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-2">
          {isConnected ? (
            <>
              <Globe className="w-3 h-3 text-green-500" />
              <span className="text-green-500">Connected to {shopifyDomain}</span>
            </>
          ) : (
            <>
              <span>Velvet Engine (Demo Preview)</span>
            </>
          )}
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          <span className="text-white">Commerce in </span>
          <span className="text-gradient">Another Dimension</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Generate 3D assets instantly. Sync with Klaviyo. Retarget in reality.
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="group relative block"
          >
            <div className="glass-panel h-full p-4 hover:-translate-y-2 transition-transform duration-500">
              {/* Image Area */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/40 mb-5 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />

                {/* Overlay Badge */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs font-mono text-white/80 border border-white/10">
                  ${product.price}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3 px-2 pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xl text-white group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>

                <div className="pt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-primary" />
                    Gen AI Ready
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div >
  );
}
