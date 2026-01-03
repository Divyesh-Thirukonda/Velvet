import { NextResponse } from 'next/server';

const KLAVIYO_CLIENT_ID = process.env.KLAVIYO_PUBLIC_KEY || 'pk_mock_key'; // Often Public Key is Client ID in new spec, checking docs... specific OAuth Client ID needed actually.
// For demo visualization, assuming we use a distinct ID or fallback.
const SCOPES = 'events:write profiles:write';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/klaviyo/callback`;

export async function GET() {
    // Construct the Auth URL
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: KLAVIYO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        state: 'random_state_string' // Should be random in prod
    });

    const url = `https://www.klaviyo.com/oauth/authorize?${params.toString()}`;

    return NextResponse.redirect(url);
}
