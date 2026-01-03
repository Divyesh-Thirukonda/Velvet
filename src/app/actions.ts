'use server';

import { cookies } from 'next/headers';

import { fetchRealShopifyProducts, publishToRealShopifyMetafield, fetchRealShopifyProduct } from '@/lib/shopify-real';

import { track3DGenerationEvent, triggerCampaignEvent } from '@/lib/klaviyo';
import { getShopifyProductById } from '@/lib/shopify';
import { generateGeometryFromImage, Primitive } from '@/lib/openai';

// Mock list of 3D models to return
const MOCK_MODELS = [
    'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
    'https://modelviewer.dev/shared-assets/models/Horse.glb'
];

export async function checkGenerationStatus(taskId: string) {
    if (taskId.startsWith('mock_')) {
        return { status: 'SUCCEEDED', progress: 100, modelUrl: MOCK_MODELS[0] };
    }
    return { status: 'FAILED', progress: 0 };
}

interface GenerationResult {
    success: boolean;
    mode: 'real' | 'mock';
    message: string;
    modelUrl?: string;     // Optional, present if Mock or Meshy (legacy)
    voxelData?: Primitive[]; // Optional, present if OpenAI Voxel
    taskId?: string;
}

// Helper to get Product (Real or Mock)
// Helper to get Product (Real or Mock)
async function getProductHelper(productId: string, allowMock: boolean = false) {
    // 1. Try Real Store First
    const cookieStore = await cookies();
    const domain = cookieStore.get('shopify_domain')?.value;
    const token = cookieStore.get('shopify_token')?.value;

    if (domain && token) {
        const realProduct = await fetchRealShopifyProduct(domain, token, productId);
        if (realProduct) return realProduct;
    }

    // 2. Fallback to Mock (STRICT MODE: Only if allowMock is true)
    if (allowMock) {
        return await getShopifyProductById(productId);
    }

    return null;
}

export async function generate3DModel(productId: string, consumerEmail: string, mode: 'real' | 'mock' = 'mock'): Promise<GenerationResult> {
    // 1. Fetch Product Data (STRICT: Real mode = No Mock Fallback)
    const product = await getProductHelper(productId, mode === 'mock');
    if (!product) throw new Error(mode === 'real'
        ? 'Product not found in connected store. (Real Mode Active)'
        : 'Product not found');

    if (mode === 'real') {
        // OPENAI VOXEL ENGINE
        const startTime = Date.now();

        // Track Intent
        track3DGenerationEvent(consumerEmail, product, "Generating (OpenAI Voxel)...").catch(console.error);

        // Generate
        const primitiveData = await generateGeometryFromImage(product.images[0]);

        // Track Success
        const duration = (Date.now() - startTime) / 1000;
        console.log(`Voxel Gen took ${duration}s`);

        return {
            success: true,
            mode: 'real',
            voxelData: primitiveData,
            message: 'Voxel Model Generated',
            taskId: `voxel_${Date.now()}`
        };
    }

    // --- Mock Flow ---
    await new Promise(resolve => setTimeout(resolve, 3000));
    const randomModel = MOCK_MODELS[Math.floor(Math.random() * MOCK_MODELS.length)];

    try {
        await track3DGenerationEvent(consumerEmail, product, randomModel);
    } catch (e) {
        console.error('Klaviyo Tracking Failed', e);
    }

    return {
        success: true,
        modelUrl: randomModel, // Explicitly string here
        taskId: `mock_${Date.now()}`,
        mode: 'mock',
        message: 'Model generated (Mock)'
    };
}

export async function publishToStore(productId: string, modelUrl: string) {
    const cookieStore = await cookies();
    const domain = cookieStore.get('shopify_domain')?.value;
    const token = cookieStore.get('shopify_token')?.value;

    if (domain && token) {
        // REAL MODE: Write to Shopify
        try {
            await publishToRealShopifyMetafield(domain, token, productId, modelUrl);
            return { success: true, message: 'Published to Real Shopify Metafields (velvet.model_url)' };
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Failed to publish to Shopify.' };
        }
    }

    // MOCK MODE
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
        success: true,
        message: '3D Model published (Simulation Mode - Connect Store for Real)'
    };
}

export async function sendCampaignAction(productId: string, segment: string, email: string, modelUrl: string) {
    // 1. Fetch Product details for the payload (Strict Real)
    const product = await getProductHelper(productId, false);
    if (!product) return { success: false, message: 'Product not found' };

    // 2. Trigger Real Klaviyo Event
    try {
        await triggerCampaignEvent(email, segment, product, modelUrl);
        return { success: true, message: 'Campaign Triggered in Klaviyo' };
    } catch (e) {
        return { success: false, message: 'Failed to trigger campaign' };
    }
}

export async function saveShopifyConfig(domain: string, token: string) {
    const cookieStore = await cookies();
    cookieStore.set('shopify_domain', domain);
    cookieStore.set('shopify_token', token);
    return { success: true };
}

export async function disconnectStore() {
    const cookieStore = await cookies();
    cookieStore.delete('shopify_domain');
    cookieStore.delete('shopify_token');
    return { success: true };
}
