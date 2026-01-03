// src/lib/shopify.ts

export interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: string;
  vendor: string;
}

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    title: 'Ergonomic Aero Chair',
    description: 'The ultimate in comfort and style. Breathable mesh back, adjustable lumbar support, and sleek aluminum finish.',
    images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600'],
    price: '299.00',
    vendor: 'AeroLine'
  },
  {
    id: 'prod_002',
    title: 'Minimalist Desk Lamp',
    description: 'A touch-sensitive LED lamp with adjustable brightness and color temperature. Perfect for late-night work sessions.',
    images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=600'],
    price: '89.00',
    vendor: 'Lumina'
  },
  {
    id: 'prod_003',
    title: 'Sonic Noise-Canceling Headphones',
    description: 'Immerse yourself in music with our industry-leading noise cancellation technology. 30-hour battery life.',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'],
    price: '199.00',
    vendor: 'SonicAudio'
  }
];

export async function getShopifyProducts(): Promise<Product[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return DEMO_PRODUCTS;
}

export async function getShopifyProductById(id: string): Promise<Product | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return DEMO_PRODUCTS.find(p => p.id === id);
}
