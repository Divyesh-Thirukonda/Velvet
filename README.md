# Velvet: AI-Powered 3D Commerce Engine 💎

## Problem Statement
**E-commerce is flat.** 
Online shopping suffers from a "dimension gap." Customers hesitate to buy premium products because static 2D images fail to convey scale, texture, and volume. This leads to:
-   **Lower Conversion Rates**: High-intent buyers bounce because they can't "feel" the product.
-   **High Return Rates (~30%)**: Products arrive looking different than expected.
-   **Generic Retargeting**: "You left this in your cart" emails are boring and lack visual context.

## Solution Overview
**Velvet** is an end-to-end **Generative 3D Commerce Engine** that turns static images into interactive 3D assets and leverages them for personalized marketing.

1.  **Multi-Model AI Pipeline**: 
    -   **Perception**: Uses **Google Gemini 1.5 Pro** to analyze product images, identifying materials, dimensions, and stylistic features.
    -   **Construction**: Uses **OpenAI GPT-4o** to "dream" the structural geometry into a 3D Voxel model.
2.  **Instant Publishing**: Generated models are automatically synced to **Shopify Metafields** (`velvet.model_url`), making them ready for AR viewing on the storefront.
3.  **Klaviyo Intelligence**: The generation event triggers a specialized **Klaviyo Campaign**, injecting the interactive 3D model link directly into retargeting flows.

## Architecture & Tech Stack
Built for speed, stability, and "Clean Industrial" aesthetics.

-   **Frontend**: **Next.js 16** (App Router, Turbopack) with **Tailwind CSS v4**.
-   **3D Rendering**: Hybrid approach using **React Three Fiber (R3F)** for voxels and **`<model-viewer>`** for high-fidelity glTF/GLB assets.
-   **Backend**: 100% Server Actions for type safety and security.
-   **Auth**: Custom **OAuth 2.0** flows for both **Shopify** and **Klaviyo**.

## Logic Modes
-   **Real Mode**: Uses live Shopify Admin API and Klaviyo APIs. Requires valid credentials.
-   **Demo Mode**: A robust fallback simulation using high-quality local GLB assets (Chair, Lamp, Headphones) to demonstrate the full UX without external dependencies.

## Key Features

### 🔌 Seamless Integration
-   **Shopify OAuth**: "On-click" store connection with permanent token exchange.
-   **Klaviyo Connect**: Integrated OAuth flow to link marketing accounts without manual API key pasting.

### 🧠 Generative 3D
-   **Voxel Engine**: Generates abstract structural models using OpenAI.
-   **Gemini Vision**: High-fidelity metadata extraction (Material, Dimensions, Style).

### 📧 Retargeting Engine
-   **Event: `Generated 3D Model`**:
    -   **Payload**: `$value` (Price), `ModelURL`, `GenerationEngine`, `VoxelResolution`.
    -   **Use Case**: Segment "High Intent" merchants or users.
-   **Event: `Triggered 3D Campaign`**:
    -   **Payload**: `TargetSegment`, `ShopLink`, `ModelURL`.
    -   **Use Case**: Triggers a Flow in Klaviyo to send an email featuring the *specific* 3D model the user viewed.

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Divyesh-Thirukonda/Velvet.git
cd Velvet
npm install
```

### 2. Environment Variables
Create a `.env.local` file:
```bash
# AI Service Keys
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...

# Klaviyo Integration (Optional Fallback)
NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY=pk_...
# Note: Private key logic now favors OAuth tokens over static env vars

# Shopify (Required for Real OAuth)
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000`.

## Demo Walkthrough
1.  **Dashboard**: Click **"Connect Store"** to link your Shopify store.
2.  **Integrations**: Within the same modal, click **"Connect Klaviyo"** to authorize marketing access.
3.  **Product Page**: Select a product (e.g., Ergonomic Chair).
4.  **Generate**: Click **"Generate 3D Model"**. The AI pipeline (Gemini + OpenAI) creates the asset.
    -   *Note: In Demo Mode, this loads a high-quality local GLB file.*
5.  **Publish**: Sync the asset to Shopify Metafields.
6.  **Campaign**: Select a segment (e.g., "VIP Loyalty") and click **"Send to Segment"** to trigger the Klaviyo flow.

## Future Roadmap
-   **True AR in Email**: Direct `<model-viewer>` support in email clients (as standards evolve).
-   **Mesh Generation**: Moving from Voxels to textured meshes (via Meshy/CSM).
-   **Bi-Directional Sync**: Listen for Klaviyo webhooks to update Shopify customer tags.
