// src/lib/shopify.ts
// Mock data for demo purposes

export interface ProductMetadata {
  materials?: string[];
  dimensions?: { width?: string; height?: string; depth?: string };
  keyFeatures?: string[];
  designStyle?: string;
  colorPalette?: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: string;
  vendor: string;
  metadata?: ProductMetadata; // Rich context for AI generation
}

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    title: 'Ergonomic Aero Chair',
    description: 'The ultimate in comfort and style. Breathable mesh back, adjustable lumbar support, and sleek aluminum finish.',
    images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600'],
    price: '299.00',
    vendor: 'AeroLine',
    metadata: {
      materials: ['Breathable mesh fabric', 'Molded plastic seat', 'Powder-coated steel legs', 'Aluminum base'],
      dimensions: { width: '24in', height: '35in', depth: '22in' },
      keyFeatures: [
        'Curved ergonomic backrest with mesh tension',
        '4 tapered cylindrical legs',
        'Contoured seat pan with cushioning',
        'Modern Scandinavian design',
        'Fixed armrests integrated into seat'
      ],
      designStyle: 'Scandinavian Modern',
      colorPalette: ['#2C2C2C', '#D4D4D4', '#8A8A8A', '#F5F5F5']
    }
  },
  {
    id: 'prod_002',
    title: 'Minimalist Desk Lamp',
    description: 'A touch-sensitive LED lamp with adjustable brightness and color temperature. Perfect for late-night work sessions.',
    images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=600'],
    price: '89.00',
    vendor: 'Lumina',
    metadata: {
      materials: ['Brushed aluminum', 'Weighted steel base', 'Frosted glass diffuser'],
      dimensions: { width: '6in', height: '18in', depth: '6in' },
      keyFeatures: [
        'Dome-shaped lampshade',
        'Thin cylindrical neck/arm',
        'Circular weighted base',
        'Minimalist industrial design'
      ],
      designStyle: 'Industrial Minimalist',
      colorPalette: ['#E8E8E8', '#4A4A4A', '#FFFFFF']
    }
  },
  {
    id: 'prod_003',
    title: 'Sonic Noise-Canceling Headphones',
    description: 'Immerse yourself in music with our industry-leading noise cancellation technology. 30-hour battery life.',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'],
    price: '199.00',
    vendor: 'SonicAudio',
    metadata: {
      materials: ['Premium leather ear cushions', 'Brushed metal headband', 'Soft-touch plastic'],
      dimensions: { width: '7.5in', height: '8in', depth: '3.5in' },
      keyFeatures: [
        'Large circular ear cups',
        'Curved adjustable headband',
        'Padded cushions',
        'Modern tech aesthetic'
      ],
      designStyle: 'Contemporary Tech',
      colorPalette: ['#1A1A1A', '#FFD700', '#2C2C2C']
    }
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
