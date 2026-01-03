# Velvet: AI-Powered 3D Commerce Engine 💎

## Problem Statement
**E-commerce is flat.** 
Online shopping suffers from a "dimension gap." Customers hesitate to buy premium products because static 2D images fail to convey scale, texture, and volume. This leads to:
-   **Lower Conversion Rates**: High-intent buyers bounce because they can't "feel" the product.
-   **High Return Rates (~30%)**: Products arrive looking different than expected.
-   **Generic Retargeting**: "You left this in your cart" emails are boring and lack visual context.

## Solution Overview
**Velvet** is an end-to-end **Generative 3D Commerce Engine** that solves this by turning static images into interactive 3D assets and instantly leveraging them in personalized marketing.

1.  **AI Voxel Engine**: We use **OpenAI GPT-4o Vision** to analyze a standard product image and "dream" it into a 3D Voxel model (a lightweight, styled 3D representation).
2.  **Instant Publishing**: The generated 3D model is automatically written to the product's Metafields in **Shopify**, making it ready for AR viewers.
3.  **Klaviyo Intelligence**: The generation event triggers a specialized **Klaviyo Campaign**, injecting the interactive 3D model link directly into retargeting flows for high-value segments (e.g., "Lost Customers").

## Architecture / Design Decisions
We built Velvet as a modern, embedded commerce tool aimed at stability and speed ("Clean Industrial" design).

-   **Frontend**: **Next.js 15** (App Router) with **Tailwind CSS v4** for a high-performance, edge-ready UI. We used Server Actions for all data mutations to ensure type safety and security.
-   **3D Rendering**: **React Three Fiber (R3F)** & **Drei**. We chose a "Voxel" aesthetic because it's distinct, fast to render, and generated reliably by LLMs compared to hallucinating complex mesh topology.
-   **Backend Logic**: Hybrid approach.
    -   *Real Mode*: Uses **Shopify Admin API** and **Klaviyo APIs** when credentials are provided.
    -   *Demo Mode*: Includes a robust fallback simulation so judges can test the UI without needing a live Shopify store.
-   **Auth**: Custom **Shopify OAuth 2.0** flow (HMAC validation, permanent token exchange) to provide a "One-Click Connect" experience.

## Klaviyo API / SDK / MCP Usage
Velvet uses the **Klaviyo Track API** deeply to power its core value proposition. We don't just "log events"; we structure data to enable advanced segmentation.

-   **Endpoint**: `https://a.klaviyo.com/api/events/`
-   **Event: `Generated 3D Model`**:
    -   Fired when a merchant successfully creates a model.
    -   **Payload**: Includes `$value` (Price), `ModelURL`, and `GenerationEngine`.
    -   **Use Case**: Allows merchants to segment "High Intent" admins or users who interact with 3D tools.
-   **Event: `Triggered 3D Campaign`**:
    -   Fired when the "Send Campaign" action is taken.
    -   **Payload**: `TargetSegment`, `ShopLink`, `ModelURL`.
    -   **Use Case**: This event acts as a **Flow Trigger** in Klaviyo, allowing the merchant to design a dynamic email template that populates with the *specific* 3D model the user was looking at.

## Getting Started / Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/Divyesh-Thirukonda/Velvet.git
cd Velvet
npm install
```

### 2. Environment Variables
Create a \`.env.local\` file in the root directory:
```bash
# Core Keys
OPENAI_API_KEY=sk-proj-...
KLAVIYO_PRIVATE_KEY=pk_...
NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY=pk_...

# Shopify OAuth (Optional - Required for "Auto Connect")
SHOPIFY_API_KEY=your_partner_api_key
SHOPIFY_API_SECRET=your_partner_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Locally
```bash
npm run dev
```
Visit \`http://localhost:3000\`.

### 4. Connect Store
-   Click **"Connect Store"** in the navbar.
-   **Option A (OAuth)**: Enter your `your-store.myshopify.com` domain and click Connect. Approve the app in Shopify.
-   **Option B (Manual)**: Paste a Shopify Admin Access Token (`shpat_...`) directly.

## Demo
1.  **Dashboard**: See your (Real or Demo) products.
2.  **Product Page**: Click a product.
3.  **Step 1**: Click **"Generate 3D Model"**. Watch the AI reconstruct the image into voxels.
4.  **Step 2**: Click **"Publish to Store"**. This saves the asset url to `velvet.model_url` metafield in Shopify.
5.  **Step 3**: Select a target audience (e.g., "Lost Customers") and click **"Send Campaign"**. This fires the event to Klaviyo.

## Testing / Error Handling
-   **Hybrid Fallbacks**: The app handles missing credentials gracefully. If no store is connected, it switches to "Demo Mode" automatically.
-   **API Reliability**: All external API calls (Shopify, OpenAI, Klaviyo) are wrapped in `try/catch` blocks with specific error logging.
-   **Validation**: Input fields (Domain, Email) have client-side validation before submission.

## Future Improvements / Stretch Goals
-   **True AR in Email**: Working with email clients to support `<model-viewer>` directly in the inbox (currently limited by email standards).
-   **Mesh Generation**: Upgrading from Voxels to textured GLB meshes using newer image-to-3D models (e.g., Meshy or CSM) as they become faster.
-   **Bi-Directional Sync**: Listening to Klaviyo webhooks (e.g., "User Clicked 3D Model") to update Shopify tags on the customer profile.
