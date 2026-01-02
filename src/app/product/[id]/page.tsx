// src/app/product/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2, Box, Send, AlertTriangle, Layers } from 'lucide-react';
import { generate3DModel } from '@/app/actions';
import { Product, getShopifyProducts } from '@/lib/shopify';
import VoxelRenderer from '@/components/VoxelRenderer';
// Type from lib/openai
interface PrimitiveData {
    type: 'box' | 'sphere' | 'cylinder';
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color: string;
}

export default function ProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [email, setEmail] = useState('demo@example.com');
    const [status, setStatus] = useState<'idle' | 'generating' | 'complete' | 'failed'>('idle');
    const [voxelData, setVoxelData] = useState<PrimitiveData[] | null>(null);
    const [mockModelUrl, setMockModelUrl] = useState<string | null>(null);

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
            // mode='real' triggers the OpenAI Voxel flow
            const result = await generate3DModel(product.id, email, 'real');

            if (result.success && result.voxelData) {
                // Real OpenAI Result
                setVoxelData(result.voxelData);
                setStatus('complete');
            } else if (result.success && result.modelUrl) {
                // Mock Fallback
                setMockModelUrl(result.modelUrl);
                setStatus('complete');
            } else {
                setStatus('failed');
            }
        } catch (e) {
            console.error(e);
            setStatus('failed');
        }
    };

    if (!product) return <div className="text-center py-20 text-muted-foreground">Loading...</div>;

    const isVoxel = status === 'complete' && voxelData;
    const isMock = status === 'complete' && mockModelUrl;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                {/* 1. VISUAL COLUMN */}
                <div className="space-y-4">
                    <div className="aspect-square bg-[#111] border border-[#333] rounded-lg overflow-hidden relative">
                        {isVoxel ? (
                            <div className="w-full h-full">
                                <VoxelRenderer key={JSON.stringify(voxelData)} data={voxelData || []} />
                            </div>
                        ) : isMock ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/50">
                                <Box className="w-16 h-16 text-white" />
                            </div>
                        ) : status === 'failed' ? (
                            <div className="w-full h-full flex items-center justify-center text-red-500">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={product.images[0]}
                                alt={product.title}
                                className={`w-full h-full object-cover ${status === 'generating' ? 'opacity-50 blur-sm' : ''}`}
                            />
                        )}

                        {/* Status Overlay */}
                        {status === 'generating' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                                <p className="text-sm font-medium">Reconstructing...</p>
                            </div>
                        )}
                    </div>
                    {isVoxel && <div className="text-center text-xs text-muted-foreground">Powered by GPT-4o Vision</div>}
                </div>

                {/* 2. DETAILS COLUMN */}
                <div className="space-y-6">
                    <div>
                        <div className="text-xs font-mono text-muted-foreground mb-2">ID: {product.id}</div>
                        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                    </div>

                    <div className="p-6 border border-[#333] rounded-lg bg-[#0a0a0a] space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Target Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="name@example.com"
                            />
                        </div>

                        {status === 'complete' ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded flex items-center gap-2 text-green-500 text-sm">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Model Ready</span>
                                </div>
                                <button className="btn btn-primary w-full gap-2">
                                    <Send className="w-4 h-4" /> Publish to Store
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={status !== 'idle'}
                                className="btn btn-primary w-full"
                            >
                                {status === 'generating' ? 'Processing...' : 'Generate 3D Asset'}
                            </button>
                        )}

                        <div className="text-center pt-2">
                            <Link href={`/demo/product/${product.id}`} className="text-xs text-muted-foreground hover:text-white underline">
                                Switch to Demo Mode
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
