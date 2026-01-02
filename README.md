# Velvet 💎
**Commerce in Another Dimension**

> **Hackathon Submission for Klaviyo + Shopify**
> 
> *Velvet transforms static Shopify products into interactive 3D voxel assets using Generative AI, then instantly syncs them to Klaviyo for hyper-personalized retargeting campaigns.*

![Velvet Dashboard](https://github.com/user-attachments/assets/placeholder-dashboard.png)

## 🚀 The Problem
E-commerce is flat. Customers return products because they "couldn't tell what it looked like."
- **30%** of returns are due to mismatch expectations.
- **Lost Revenue**: Static images fail to convert high-intent buyers.
- **Generic Outreach**: "Come back" emails lack context.

## ✨ The Solution
Velvet is an AI-Native 3D Engine that lives inside your commerce stack.
1.  **Vision-to-Voxel Engine**: Uses **OpenAI GPT-4o Vision** to analyze product images and reconstruct them as interactive 3D voxel models.
2.  **Instant Publish**: Updates Shopify Metafields with the 3D asset URL.
3.  **Klaviyo Intelligence**: Triggers advanced flows ("Lost Customer with 3D Preview") that inject the interactive model directly into email campaigns.

## 🛠️ Tech Stack
-   **Framework**: Next.js 14 (App Router, Server Actions)
-   **Styling**: Tailwind CSS v4 ("Clean Industrial" Theme)
-   **3D Engine**: React Three Fiber (R3F) + Drei
-   **AI**: OpenAI GPT-4o (Custom Voxelizer Prompt)
-   **Integration**: 
    -   **Klaviyo**: Track API (Rich Events with `$value`, `ModelURL`)
    -   **Shopify**: Admin API (Product Sync & Metafields)

## ⚡ Key Features

### 1. AI Voxel Engine
We don't just "fetch" models. We **generate** them.
Velvet's custom engine looks at a 2D image (e.g., an Aero Chair) and "dreams" it in 3D voxels, storing the geometric data (position, color, scale) as a lightweight JSON asset.

### 2. Deep Klaviyo Sync
When a model is generated, we don't just log it. We enrich the customer profile.
\`\`\`json
{
  "event": "Generated 3D Model",
  "properties": {
    "ProductName": "Ergonomic Aero Chair",
    "$value": 299.00,
    "ModelURL": "https://velvet.app/view/voxel-123",
    "GenerationEngine": "GPT-4o Vision"
  }
}
\`\`\`
This allows you to create **Segments** like *"High Value Users who viewed 3D Models but didn't buy"*.

### 3. "Connect Store" Modal (Developer Experience)
Built for Hackathon simplicity. No complex OAuth apps.
-   Click **"Connect Store"**.
-   Paste your **Shop Domain** & **Admin Token**.
-   Instantly fetch **REAL** products from your live store.
-   (Fallback: Uses "Velvet Demo Store" for judges without credentials).

## 🏃‍♂️ Getting Started

1.  **Clone & Install**
    \`\`\`bash
    git clone https://github.com/Divyesh-Thirukonda/Velvet.git
    cd Velvet
    npm install
    \`\`\`

2.  **Environment Setup**
    Create \`.env.local\`:
    \`\`\`bash
    OPENAI_API_KEY=sk-...
    NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY=pk_...
    \`\`\`

3.  **Run**
    \`\`\`bash
    npm run dev
    \`\`\`

## 🏆 Hackathon Checklist
- [x] **Creativity**: AI Voxelization is a novel text-to-3D approach.
- [x] **Technical**: Clean Next.js 14 Server Actions architecture.
- [x] **Klaviyo**: Deep integration with Track API and Revenue metrics.
- [x] **Shopify**: Hybrid Real/Simulated data fetching.

---
*Built with 💜 by Divyesh Thirukonda.*
