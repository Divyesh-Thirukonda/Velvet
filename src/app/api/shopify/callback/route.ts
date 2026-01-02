import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');
    const code = searchParams.get('code');
    const hmac = searchParams.get('hmac');

    if (!shop || !code || !hmac) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // HMAC Verification
    const map = Object.fromEntries(searchParams.entries());
    delete map['hmac'];
    const message = Object.keys(map)
        .sort()
        .map((key) => `${key}=${map[key]}`)
        .join('&');

    const generatedHmac = crypto
        .createHmac('sha256', SHOPIFY_API_SECRET!)
        .update(message)
        .digest('hex');

    if (generatedHmac !== hmac) {
        return NextResponse.json({ error: 'HMAC validation failed' }, { status: 403 });
    }

    // Exchange Code for Access Token
    try {
        const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: SHOPIFY_API_KEY,
                client_secret: SHOPIFY_API_SECRET,
                code,
            }),
        });

        const data = await tokenResponse.json();

        if (!data.access_token) {
            throw new Error('No access token received');
        }

        // Redirect to Dashboard with Cookies
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.set('shopify_domain', shop);
        response.cookies.set('shopify_token', data.access_token);

        return response;

    } catch (error) {
        console.error('OAuth Error:', error);
        return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
    }
}
