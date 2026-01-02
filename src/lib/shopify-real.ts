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
            vendor: p.vendor
        }));

    } catch (error) {
        console.error('Failed to fetch real products:', error);
        return [];
    }
}
