import { getShopifyProducts } from '@/lib/shopify';
import { Package, ArrowRight, Wand2 } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const products = await getShopifyProducts();

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Product <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Select a product to generate a high-fidelity 3D model. We'll automatically sync the asset to your store and notify interested customers via Klaviyo.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="glass-panel p-5 flex flex-col gap-4 group hover:border-primary/30 transition-all duration-300">
            {/* Image Placeholder */}
            <div className="aspect-square rounded-lg overflow-hidden bg-secondary relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link href={`/product/${product.id}`} className="btn btn-primary gap-2">
                  <Wand2 className="w-4 h-4" />
                  Generate 3D
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg truncate pr-2">{product.title}</h3>
                <span className="text-primary font-mono">${product.price}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
            </div>

            <div className="pt-2 mt-auto border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
              <span>{product.vendor}</span>
              <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                Manage <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
