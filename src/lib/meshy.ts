// src/lib/meshy.ts
// Client for Meshy API v3
// Docs reference: https://docs.meshy.ai/

const MESHY_API_KEY = process.env.MESHY_API_KEY;

export interface MeshyTaskResult {
    id: string;
    model_urls: {
        glb: string;
        usdz: string;
    };
    thumbnail_url: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';
    progress: number;
}

export async function createMeshyTask(imageUrl: string): Promise<string> {
    if (!MESHY_API_KEY) throw new Error('MESHY_API_KEY not configured');

    const response = await fetch('https://api.meshy.ai/v2/image-to-3d', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${MESHY_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image_url: imageUrl,
            enable_pbr: true,
            should_remesh: true
        })
    });

    if (!response.ok) {
        throw new Error(`Meshy API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result; // Task ID
}

export async function getMeshyTask(taskId: string): Promise<MeshyTaskResult> {
    if (!MESHY_API_KEY) throw new Error('MESHY_API_KEY not configured');

    const response = await fetch(`https://api.meshy.ai/v2/image-to-3d/${taskId}`, {
        headers: {
            'Authorization': `Bearer ${MESHY_API_KEY}`
        },
    });

    if (!response.ok) {
        throw new Error(`Meshy API Error: ${response.statusText}`);
    }

    return await response.json();
}
