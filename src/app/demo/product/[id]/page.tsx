// src/app/demo/product/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2, Box, Send, AlertTriangle, Globe, Mail, Users, Zap, Wand2 } from 'lucide-react';
import { generate3DModel, publishToStore } from '@/app/actions';
import { Product, getShopifyProducts } from '@/lib/shopify';
import VoxelRenderer from '@/components/VoxelRenderer';

// Type from lib/openai
interface PrimitiveData {
    type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'capsule';
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color: string;
    radius?: number;
    tube?: number;
}

export default function DemoProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [status, setStatus] = useState<'idle' | 'generating' | 'complete' | 'failed'>('idle');
    const [voxelData, setVoxelData] = useState<PrimitiveData[] | null>(null);
    const [mockModelUrl, setMockModelUrl] = useState<string | null>(null);

    // Publishing State
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    // Campaign State
    const [targetSegment, setTargetSegment] = useState('Lost Customers (30 Days)');
    const [customEmail, setCustomEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

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
            // Force REAL mode (Voxel Engine) even for demo
            const result = await generate3DModel(product.id, 'demo-user', 'real');

            if (result.success && result.voxelData) {
                setVoxelData(result.voxelData);
                setStatus('complete');
            } else if (result.success && result.modelUrl) {
                // Fallback to mock URL if backend decided to fallback
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

    const handlePublish = async () => {
        if (!product) return;
        setIsPublishing(true);
        await publishToStore(product.id, 'mock-asset-url');
        setIsPublishing(false);
        setIsPublished(true);
    };

    const handleSendCampaign = async () => {
        setIsSending(true);

        const emailTarget = customEmail || 'demo-user@example.com';
        if (customEmail && !customEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            alert('Please enter a valid email address.');
            setIsSending(false);
            return;
        }

        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 1000));
        await generate3DModel(product!.id, customEmail || 'demo-segment', 'mock');
        setIsSending(false);
        setIsSent(true);
    };

    if (!product) return <div className="text-center py-20 text-muted-foreground">Loading Demo...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
            </Link>

            <div className="flex flex-col md:flex-row gap-12 items-start">

                {/* 1. VISUAL COLUMN (Left) */}
                <div className="w-full md:w-3/5 space-y-4">
                    <div className="aspect-[4/3] bg-[#111] border border-[#333] rounded-lg overflow-hidden relative group">
                        <div className="absolute top-4 left-4 z-20 px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs font-mono font-bold flex items-center gap-2">
                            <Zap className="w-3 h-3 fill-current" /> DEMO MODE
                        </div>

                        {status === 'complete' ? (
                            <div className="w-full h-full bg-[#111]">
                                {voxelData ? (
                                    <VoxelRenderer key={JSON.stringify(voxelData)} data={voxelData} />
                                ) : (
                                    /* @ts-ignore */
                                    <model-viewer
                                        src={mockModelUrl}
                                        poster={product.images[0]}
                                        camera-controls
                                        auto-rotate
                                        shadow-intensity="1"
                                        camera-orbit="45deg 55deg 2.5m"
                                        field-of-view="30deg"
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                )}
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
                                className={`w-full h-full object-cover ${status === 'generating' ? 'opacity-50 blur-sm scale-110' : ''} transition-all duration-700`}
                            />
                        )}

                        {/* Status Overlay */}
                        {status === 'generating' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                                <p className="text-sm font-medium">Reconstructing Geometry...</p>
                                <p className="text-xs text-muted-foreground">GPT-4o Vision Processing</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. ACTIONS COLUMN (Right) */}
                <div className="w-full md:w-2/5 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                        <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
                    </div>

                    {status !== 'complete' ? (
                        <>
                            <div className="p-6 border border-[#333] rounded-lg bg-[#0a0a0a]">
                                <h3 className="font-semibold mb-4">Step 1: Generate Asset</h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Create a 3D Voxel representation (Simulated).
                                </p>
                                <button
                                    onClick={handleGenerate}
                                    disabled={status === 'generating'}
                                    className="btn btn-primary w-full gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    <Box className="w-4 h-4" />
                                    {status === 'generating' ? 'Processing...' : 'Instant Generate'}
                                </button>
                            </div>

                            {/* Variant Studio */}
                            <div className="p-6 border border-[#333] rounded-lg bg-[#0a0a0a]">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Wand2 className="w-4 h-4 text-purple-400" /> Variant Studio
                                </h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Restyle this product using Generative AI.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. Midnight Blue Leather"
                                        className="input text-sm"
                                        id="variant-api-input"
                                    />
                                    <button
                                        onClick={async () => {
                                            const input = document.getElementById('variant-api-input') as HTMLInputElement;
                                            if (!input?.value) return;
                                            const prompt = input.value;

                                            // 1. Optimistic UI updates
                                            const btn = document.getElementById('variant-btn') as HTMLButtonElement;
                                            const originalText = btn.innerText;
                                            btn.innerText = 'Creating...';
                                            btn.disabled = true;

                                            try {
                                                // 2. Call Backend
                                                // Dynamic import to avoid circular dep issues in some setups, but here we can just import
                                                const { generateVariantImage } = await import('@/app/actions');
                                                const res = await generateVariantImage(product!.id, 'demo', prompt);

                                                if (res.success && res.imageUrl && product) {
                                                    // 3. Update Product Image locally to the new variant
                                                    setProduct({ ...product, images: [res.imageUrl] });
                                                    // Reset 3D status to force regeneration
                                                    setStatus('idle');
                                                    setVoxelData(null);
                                                    setMockModelUrl(null);
                                                } else {
                                                    alert('Variant generation failed.');
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert('Error generating variant');
                                            } finally {
                                                btn.innerText = originalText;
                                                btn.disabled = false;
                                            }
                                        }}
                                        id="variant-btn"
                                        className="btn border border-[#333] hover:bg-white/5"
                                    >
                                        <Wand2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Publishing Card */}
                            <div className="p-5 border border-[#333] rounded-lg bg-[#0a0a0a]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Globe className="w-4 h-4 text-white" />
                                    <h3 className="font-semibold text-sm">Step 2: Storefront</h3>
                                </div>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Publish this asset to Shopify Product Metafields.
                                </p>
                                <button
                                    onClick={handlePublish}
                                    disabled={isPublished || isPublishing}
                                    className={`btn w-full gap-2 ${isPublished ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'btn-primary'}`}
                                >
                                    {isPublished ? (
                                        <> <CheckCircle2 className="w-4 h-4" /> Published </>
                                    ) : (
                                        <> {isPublishing ? 'Publishing...' : 'Publish to Store'} </>
                                    )}
                                </button>
                            </div>

                            {/* Campaign Card */}
                            <div className="p-5 border border-[#333] rounded-lg bg-[#0a0a0a]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Mail className="w-4 h-4 text-white" />
                                    <h3 className="font-semibold text-sm">Step 3: Campaign</h3>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <label className="text-xs font-medium text-muted-foreground block">Target Audience</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                                        <select
                                            value={targetSegment}
                                            onChange={(e) => setTargetSegment(e.target.value)}
                                            className="w-full bg-[#111] border border-[#333] rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white appearance-none"
                                        >
                                            <option className="text-white bg-[#111]">Lost Customers (30 Days)</option>
                                            <option className="text-white bg-[#111]">Cart Abandoners (High Value)</option>
                                            <option className="text-white bg-[#111]">VIP Loyalty Members</option>
                                            <option className="text-white bg-[#111]">Specific Email (Test)</option>
                                        </select>
                                    </div>

                                    {targetSegment === 'Specific Email (Test)' && (
                                        <input
                                            type="email"
                                            placeholder="name@example.com"
                                            value={customEmail}
                                            onChange={(e) => setCustomEmail(e.target.value)}
                                            className="input mt-2"
                                        />
                                    )}
                                </div>

                                <button
                                    onClick={handleSendCampaign}
                                    disabled={isSent || isSending}
                                    className={`btn w-full gap-2 font-medium transition-all ${isSent
                                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                        : 'bg-white text-black hover:bg-gray-200 border-transparent'
                                        }`}
                                >
                                    {isSent ? (
                                        <> <CheckCircle2 className="w-4 h-4" /> Campaign Queued </>
                                    ) : (
                                        <> <Send className="w-4 h-4" /> {isSending ? 'Sending...' : 'Send to Segment'} </>
                                    )}
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
