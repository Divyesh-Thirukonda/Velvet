import { NextRequest, NextResponse } from 'next/server';

const KLAVIYO_CLIENT_ID = process.env.KLAVIYO_PUBLIC_KEY || 'pk_mock_test';
const KLAVIYO_CLIENT_SECRET = process.env.KLAVIYO_PRIVATE_KEY || 'sk_mock_test';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/klaviyo/callback`;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    // MOCK FLOW: If we are in demo mode, just set a fake token and redirect
    if (!code || KLAVIYO_CLIENT_ID.includes('mock')) {
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.set('klaviyo_token', 'mock_access_token_123', { httpOnly: true, secure: true });
        return response;
    }

    try {
        // Exchange Code for Access Token
        // Note: Code exchange endpoint might differ for Klaviyo, checking standard OAuth2
        const tokenResponse = await fetch('https://a.klaviyo.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${KLAVIYO_CLIENT_ID}:${KLAVIYO_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });

        const data = await tokenResponse.json();

        if (!data.access_token) {
            console.error('Klaviyo OAuth Failed', data);
            return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
        }

        const response = NextResponse.redirect(new URL('/', request.url));
        // Set the cookie for future requests
        response.cookies.set('klaviyo_token', data.access_token, { httpOnly: true, secure: true });
        // Optional: Store refresh token if needed

        return response;

    } catch (error) {
        console.error('Klaviyo Callback Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
