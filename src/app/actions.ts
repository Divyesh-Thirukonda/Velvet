'use server';

import { cookies } from 'next/headers';

import { fetchRealShopifyProducts, publishToRealShopifyMetafield, fetchRealShopifyProduct } from '@/lib/shopify-real';

import { track3DGenerationEvent, triggerCampaignEvent } from '@/lib/klaviyo';
import { getShopifyProductById } from '@/lib/shopify';
import { generateGeometryFromImage, Primitive } from '@/lib/openai';

// Real-only actions

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

export async function generate3DModel(productId: string, consumerEmail: string): Promise<GenerationResult> {
    // 1. Fetch Product Data (Strict Real)
    const product = await getProductHelper(productId, false);

    if (!product) {
        throw new Error('Product not found in connected store. Please connect a Shopify store.');
    }

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

    return {
        success: false,
        message: 'No store connected. Please connect a Shopify store to publish.'
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
