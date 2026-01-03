'use server';

import { cookies } from 'next/headers';

import { fetchRealShopifyProducts, publishToRealShopifyMetafield, fetchRealShopifyProduct } from '@/lib/shopify-real';

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { track3DGenerationEvent, triggerCampaignEvent, trackVariantGeneration } from '@/lib/klaviyo';
import { getShopifyProductById } from '@/lib/shopify';
import { generateGeometryFromImage, Primitive } from '@/lib/openai';

// Real-only actions

// Mock list of 3D models to return
// Deterministic Mock Models for Demo Products
const RELEVANT_MODELS: Record<string, string> = {
    'chair': 'https://modelviewer.dev/shared-assets/models/Chair.glb',
    'lamp': 'https://modelviewer.dev/shared-assets/models/Mixer.glb', // Visualization placeholder
    'headphones': 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', // Tech placeholder
    'default': 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb'
};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// User provided Key for Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
if (!GEMINI_API_KEY) console.warn("GEMINI_API_KEY is not set.");
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function generateVariantImage(productId: string, consumerEmail: string, variantPrompt: string): Promise<{ success: boolean; imageUrl?: string; message: string }> {
    // 1. Fetch Product
    const product = await getProductHelper(productId, true); // Allow mock for demo flexibility
    if (!product) return { success: false, message: 'Product not found' };

    const originalImage = product.images[0];

    try {
        // 2. Vision Analysis + Prompt Synthesis (Google Gemini)
        console.log("Analyzing with Gemini 1.5 Flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Fetch user image to pass to Gemini
        const imageResp = await fetch(originalImage);
        const imageBuffer = await imageResp.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');

        const prompt = `
        You are a Creative Director. 
        I need a DALL-E 3 prompt to generate a new product variant.
        Original Product: See image.
        User Request: "${variantPrompt}"
        
        Output ONLY the detailed prompt text describing the new variant, maintaining the original angle and composition.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const dallePrompt = result.response.text();
        console.log("Gemini Generated Prompt:", dallePrompt);

        // 3. Generate Image (DALL-E 3) 
        // (Maintaining DALL-E for generation reliability in this environment, driven by Gemini Intelligence)
        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: dallePrompt,
            n: 1,
            size: "1024x1024",
            response_format: "url"
        });

        const newImageUrl = imageResponse.data?.[0]?.url;
        if (!newImageUrl) throw new Error("No image generated");

        // 4. Track in Klaviyo (Meaningful API Usage)
        await trackVariantGeneration(consumerEmail, product, variantPrompt, newImageUrl);

        return { success: true, imageUrl: newImageUrl, message: 'Variant Generated via Gemini' };

    } catch (e) {
        console.error("Variant Gen Error:", e);
        return { success: false, message: 'Failed to generate variant.' };
    }
}

/*
const MOCK_MODELS = [
    'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
    'https://modelviewer.dev/shared-assets/models/Horse.glb'
];
*/

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
    // 1. Fetch Product Data
    // We allow mock data if mode is 'mock' OR if it's a specific 'prod_' demo ID being run in 'real' mode.
    const isDemoId = productId.startsWith('prod_');
    const allowMockData = mode === 'mock' || isDemoId;

    const product = await getProductHelper(productId, allowMockData);

    // Strict check: If we are in real mode and NOT a demo ID, we must have a Real Product.
    if (!product) {
        throw new Error('Product not found.');
    }


    if (mode === 'real') {
        // OPENAI VOXEL ENGINE
        const startTime = Date.now();

        // Track Intent
        track3DGenerationEvent(consumerEmail, product, "Generating (OpenAI Voxel)...").catch(console.error);

        // 1. Perception Step (Gemini)
        // User Request: "Describe the image and product in our own words... make up the data for these"
        console.log(`[Voxel Engine] Analyzing structure with Gemini: ${product.title}`);
        let structuralDescription = "";
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const imageResp = await fetch(product.images[0]);
            const imageBuffer = await imageResp.arrayBuffer();
            const imageBase64 = Buffer.from(imageBuffer).toString('base64');

            const visionPrompt = `
            Analyze this product image for 3D reconstruction.
            Describe the physical structure in detail, breaking it down into simple geometric shapes (cylinders, boxes, spheres).
            Mention relative positions, colors, and proportions.
            Example: "A chair with 4 thin cylindrical legs, a square thick seat cushion, and a curved rectangular backrest."
            
            Be precise and technical.
            `;

            const result = await model.generateContent([
                visionPrompt,
                { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
            ]);
            structuralDescription = result.response.text();
            console.log(`[Voxel Engine] Gemini Analysis: ${structuralDescription.slice(0, 100)}...`);
        } catch (e) {
            console.error("Gemini Vision failed, falling back to direct generation", e);
        }

        // 2. Generation Step (OpenAI with Context)
        console.log(`[Voxel Engine] Generating geometry for: ${product.title}`);

        // Pass the Gemini description to guiding the voxel placement
        const primitiveData = await generateGeometryFromImage(product.images[0], structuralDescription);
        console.log(`[Voxel Engine] Success. Primitives count: ${primitiveData?.length}`);

        // Track Success
        const duration = (Date.now() - startTime) / 1000;
        console.log(`Voxel Gen took ${duration}s`);

        return {
            success: true,
            mode: 'real',
            voxelData: primitiveData, // Ensure this is not undefined
            message: 'Voxel Model Generated',
            taskId: `voxel_${Date.now()}`
        };
    }

    // --- Mock Flow ---
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Deterministic Selection based on Product Title
    const lowerTitle = product.title.toLowerCase();
    let selectedModel = RELEVANT_MODELS['default'];

    if (lowerTitle.includes('chair')) selectedModel = RELEVANT_MODELS['chair'];
    else if (lowerTitle.includes('lamp')) selectedModel = RELEVANT_MODELS['lamp'];
    else if (lowerTitle.includes('headphones')) selectedModel = RELEVANT_MODELS['headphones'];

    // Fallback if random was desired, but for demo continuity we prefer deterministic
    // const randomModel = MOCK_MODELS[Math.floor(Math.random() * MOCK_MODELS.length)];

    try {
        await track3DGenerationEvent(consumerEmail, product, selectedModel);
    } catch (e) {
        console.error('Klaviyo Tracking Failed', e);
    }

    return {
        success: true,
        modelUrl: selectedModel,
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
