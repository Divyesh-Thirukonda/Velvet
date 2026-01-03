// src/app/product/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2, Box, Send, AlertTriangle, Globe, Mail, Users } from 'lucide-react';
import { generate3DModel, publishToStore, sendCampaignAction } from '@/app/actions';
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

export default function ProductPage() {
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
            // Use mock mode with realistic Sketchfab models
            const result = await generate3DModel(product.id, 'system-init', 'mock');
            if (result.success && result.voxelData) {
                setVoxelData(result.voxelData);
                setStatus('complete');
            } else if (result.success && result.modelUrl) {
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
        // Simulate publishing
        await publishToStore(product.id, 'voxel-asset-url');
        setIsPublishing(false);
        setIsPublished(true);
    };

    const handleSendCampaign = async () => {
        setIsSending(true);
        const emailTarget = customEmail || 'divyesh.thirukonda@gmail.com'; // Default for demo if empty

        if (!emailTarget.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            alert("Please enter a valid email address.");
            setIsSending(false);
            return;
        }

        const urlToShare = mockModelUrl || 'https://velvet.app/view/voxel-demo'; // Fallback

        await sendCampaignAction(product!.id, targetSegment, emailTarget, urlToShare);

        setIsSending(false);
        setIsSent(true);
    };

    if (!product) return <div className="text-center py-20 text-muted-foreground">Loading...</div>;

    const isVoxel = status === 'complete' && voxelData;
    const isMock = status === 'complete' && mockModelUrl;

    return (
        <div className="max-w-6xl mx-auto py-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
            </Link>

            <div className="flex flex-col md:flex-row gap-12 items-start">

                {/* 1. VISUAL COLUMN (Left) */}
                <div className="w-full md:w-3/5 space-y-4">
                    <div className="aspect-[4/3] bg-[#111] border border-[#333] rounded-lg overflow-hidden relative">
                        {isVoxel ? (
                            <div className="w-full h-full">
                                <VoxelRenderer key={JSON.stringify(voxelData)} data={voxelData || []} />
                            </div>
                        ) : isMock ? (
                            <div className="w-full h-full bg-[#111]">
                                <iframe
                                    src={mockModelUrl || ''}
                                    title="3D Model Viewer"
                                    frameBorder="0"
                                    allow="autoplay; fullscreen; xr-spatial-tracking"
                                    style={{ width: '100%', height: '100%', minHeight: '400px' }}
                                />
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
                        <div className="p-6 border border-[#333] rounded-lg bg-[#0a0a0a]">
                            <h3 className="font-semibold mb-4">Step 1: Generate Asset</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Create a 3D Voxel representation using OpenAI Vision.
                            </p>
                            <button
                                onClick={handleGenerate}
                                disabled={status === 'generating'}
                                className="btn btn-primary w-full gap-2"
                            >
                                <Box className="w-4 h-4" />
                                {status === 'generating' ? 'Analyzing...' : 'Generate 3D Model'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Publishing Card */}
                            <div className="p-5 border border-[#333] rounded-lg bg-[#0a0a0a]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Globe className="w-4 h-4 text-white" />
                                    <h3 className="font-semibold text-sm">Step 2: Storefront</h3>
                                </div>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Publish this asset to Shopify Product Metafields for AR viewing.
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
