// src/lib/klaviyo.ts

const KLAVIYO_PRIVATE_KEY = process.env.NEXT_PUBLIC_KLAVIYO_PRIVATE_KEY || 'pk_mock_key';
const KLAVIYO_REVISION = '2025-01-15'; // Always pin to a specific revision

export async function track3DGenerationEvent(email: string, product: any, modelUrl: string) {
    // 1. Check for Mock Mode
    if (KLAVIYO_PRIVATE_KEY === 'pk_mock_key') {
        console.log('[MOCK KLAVIYO] Tracking "Generated 3D Model" Event:', { email, title: product.title });
        return { success: true, mock: true };
    }

    // 2. Construct Payload for Tracking API
    const url = 'https://a.klaviyo.com/api/events/';
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
            'accept': 'application/vnd.api+json',
            'revision': KLAVIYO_REVISION,
            'content-type': 'application/vnd.api+json'
        },
        body: JSON.stringify({
            data: {
                type: 'event',
                attributes: {
                    properties: {
                        ProductName: product.title,
                        ProductID: product.id,
                        ModelURL: modelUrl,
                        Price: product.price,
                        ImageURL: product.images[0],
                        ActionSource: 'Shopify 3D Console'
                    },
                    metric: {
                        data: {
                            type: 'metric',
                            attributes: {
                                name: 'Generated 3D Model'
                            }
                        }
                    },
                    profile: {
                        data: {
                            type: 'profile',
                            attributes: {
                                email: email,
                                // We can add more profile fields here if available
                            }
                        }
                    }
                }
            }
        })
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Klaviyo API Error:', response.status, errorBody);
            throw new Error(`Klaviyo API Error: ${response.statusText}`);
        }
        return await response.json(); // Usually 202 Accepted with empty body or created object
    } catch (error) {
        console.error('Klaviyo Tracking Exception:', error);
        // We throw so the UI can know, or we swallow and return warnings.
        // For this critical path, we should probably allow partial success but log heavily.
        throw error;
        // ... (previous code)
    }
}

export async function getKlaviyoMetricId(metricName: string) {
    if (!KLAVIYO_PRIVATE_KEY || KLAVIYO_PRIVATE_KEY.startsWith('pk_mock')) return null;

    const response = await fetch(`https://a.klaviyo.com/api/metrics/?filter=equals(attributes.name,"${metricName}")`, {
        method: 'GET',
        headers: {
            'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
            'accept': 'application/vnd.api+json',
            'revision': KLAVIYO_REVISION
        }
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.data?.[0]?.id || null;
}

export async function getRecentKlaviyoEvents(metricName: string) {
    const metricId = await getKlaviyoMetricId(metricName);
    if (!metricId) return [];

    const response = await fetch(`https://a.klaviyo.com/api/events/?filter=equals(metric_id,"${metricId}")&sort=-timestamp&page[size]=10&include=profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
            'accept': 'application/vnd.api+json',
            'revision': KLAVIYO_REVISION
        }
    });

    if (!response.ok) return [];
    const json = await response.json();

    // map to cleaner format
    return json.data.map((event: any) => {
        // Find profile if included
        const profileId = event.relationships?.profile?.data?.id;
        const profile = json.included?.find((inc: any) => inc.id === profileId);
        const email = profile?.attributes?.email || 'Unknown User';

        return {
            id: event.id,
            timestamp: event.attributes.timestamp,
            email: email,
            properties: event.attributes.properties
        };
    });
}

export async function identifyProfile(email: string, properties: Record<string, any>) {
    if (KLAVIYO_PRIVATE_KEY === 'pk_mock_key') return;

    const url = 'https://a.klaviyo.com/api/profiles/';
    // Implementation would go here calling the Profiles API
    // For this hackathon, the Event tracking above actually creates/updates the profile automatically,
    // so this is just a helper if we needed unrelated updates.
    console.log('Identifying profile:', email, properties);
}
