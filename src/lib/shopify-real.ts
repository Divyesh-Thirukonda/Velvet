// src/lib/shopify-real.ts

export async function fetchRealShopifyProducts(domain: string, token: string) {
    const endpoint = `https://${domain}/admin/api/2024-01/products.json?limit=10&status=active`;

    try {
        const response = await fetch(endpoint, {
            headers: {
                'X-Shopify-Access-Token': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Shopify API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Map to our internal Product interface
        return data.products.map((p: any) => ({
            id: String(p.id),
            title: p.title,
            description: p.body_html?.replace(/<[^>]*>?/gm, '') || p.title, // Strip HTML
            images: p.images.map((img: any) => img.src),
            price: p.variants?.[0]?.price || '0.00',
            vendor: p.vendor,
            metadata: undefined // Real products don't have metadata yet (would fetch from Klaviyo in production)
        }));

    } catch (error) {
        console.error('Failed to fetch real products:', error);
        return [];
    }
}

export async function fetchRealShopifyProduct(domain: string, token: string, id: string) {
    const endpoint = `https://${domain}/admin/api/2024-01/products/${id}.json`;

    try {
        const response = await fetch(endpoint, {
            headers: {
                'X-Shopify-Access-Token': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;

        const data = await response.json();
        const p = data.product;

        return {
            id: String(p.id),
            title: p.title,
            description: p.body_html?.replace(/<[^>]*>?/gm, '') || p.title,
            images: p.images.map((img: any) => img.src),
            price: p.variants?.[0]?.price || '0.00',
            vendor: p.vendor,
            metadata: undefined // Would fetch from Klaviyo in production
        };

    } catch (error) {
        console.error('Failed to fetch real product:', error);
        return null;
    }
}

export async function publishToRealShopifyMetafield(domain: string, token: string, productId: string, modelUrl: string) {
    // 1. We must find the correct Metafield endpoint (Product specific)
    const endpoint = `https://${domain}/admin/api/2024-01/products/${productId}/metafields.json`;

    // 2. Payload for Metafield
    const payload = {
        metafield: {
            namespace: 'velvet',
            key: 'model_url',
            value: modelUrl,
            type: 'url',
            description: 'Generated 3D Voxel Model'
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Shopify Metafield Error: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to publish metafield:', error);
        throw error;
    }
}
