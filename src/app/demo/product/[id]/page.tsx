// src/app/demo/product/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2, Box, Send } from 'lucide-react';
import { generate3DModel } from '@/app/actions';
import { Product, getShopifyProducts } from '@/lib/shopify';

export default function DemoProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [email, setEmail] = useState('demo@example.com');
    const [status, setStatus] = useState<'idle' | 'generating' | 'complete'>('idle');
    const [modelUrl, setModelUrl] = useState<string | null>(null);

    useEffect(() => {
        getShopifyProducts().then(products => {
            const p = products.find(p => p.id === params.id);
            if (p) setProduct(p);
        });
    }, [params.id]);

    const handleGenerate = async () => {
        if (!product) return;
        setStatus('generating');

        try {
            // Explicitly force 'mock' mode
            const result = await generate3DModel(product.id, email, 'mock');

            // STRICT NULL CHECK
            if (result.success && result.modelUrl) {
                setModelUrl(result.modelUrl as string);
                setStatus('complete');
            }
        } catch (e) {
            console.error(e);
            setStatus('idle');
        }
    };

    if (!product) return <div className="text-center py-20 text-muted-foreground">Loading Demo Product...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Visual Side */}
                <div className="space-y-6">
                    <div className="aspect-square rounded-2xl bg-secondary/50 border border-white/5 overflow-hidden relative group">
                        {status === 'complete' && modelUrl ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/20">
                                <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                        <Box className="w-10 h-10 text-primary" />
                                    </div>
                                    <p className="text-primary font-medium">Interactive 3D Ready (Mock)</p>
                                </div>
                            </div>
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={product.images[0]}
                                alt={product.title}
                                className={`w-full h-full object-cover transition-all duration-700 ${status === 'generating' ? 'scale-110 blur-sm opacity-50' : ''}`}
                            />
                        )}

                        {status === 'generating' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-lg font-medium glow-text">Simulating Scan...</p>
                                <p className="text-sm text-muted-foreground">Instant Demo Mode</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls Side */}
                <div className="flex flex-col justify-center space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">DEMO MODE</span>
                            <h2 className="text-primary font-mono text-sm">SKU: {product.id}</h2>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
                    </div>

                    <div className="glass-panel p-6 space-y-6 bg-secondary/10">
                        {status === 'complete' ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3 text-primary">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-medium">Assets Ready</span>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={status !== 'idle'}
                                className="btn btn-primary w-full text-lg py-4 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                            >
                                <Box className="w-5 h-5 mr-2" />
                                {status === 'generating' ? 'Simulating...' : 'Instant Generate (Mock)'}
                            </button>
                        )}
                        <div className="pt-4 border-t border-white/5 text-center">
                            <Link href={`/product/${product.id}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                Switch to Real AI Mode →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
