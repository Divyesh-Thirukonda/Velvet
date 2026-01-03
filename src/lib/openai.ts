// src/lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface Primitive {
    type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'capsule';
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color: string;
    // Optional parameters for specific shapes
    radius?: number; // For torus inner radius
    tube?: number;   // For torus tube thickness
}

export async function generateGeometryFromImage(imageUrl: string, description?: string): Promise<Primitive[]> {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI API Key missing");

    const context = description ? `\n\nCONTEXT FROM VISUAL ANALYSIS:\n"${description}"\n\nUse this context to guide your reconstruction.` : '';

    const prompt = `
    You are an advanced 3D reconstruction engine. Analyze the provided image and reconstruct it using a HIGH-DENSITY composition of geometric primitives.
    ${context}

    Output strictly valid JSON (no markdown block) with a root object containing a "primitives" key.
    
    IMPORTANT: Generate 50-100 primitives for EXTREME DETAIL. Use a variety of shapes to capture fine details.
    
    Available Shapes:
    - box: For flat surfaces, panels, rectangular components
    - cylinder: For legs, arms, tubes, cylindrical parts
    - sphere: For rounded endpoints, knobs, spherical elements
    - cone: For tapered elements, decorative tips, pointed components
    - capsule: For rounded cylinders (pill-shaped), smooth transitions
    - torus: For rings, circular trim, rounded edges (specify radius & tube)
    
    Structure:
    {
      "primitives": [
        {
          "type": "box" | "sphere" | "cylinder" | "cone" | "capsule" | "torus",
          "position": [x, y, z], // Coordinates between -5 and 5
          "scale": [w, h, d],    // Sizes between 0.05 and 5
          "rotation": [x, y, z], // Radians
          "color": "#hexcode",   // Sample exact colors from image
          "radius": 0.5,         // Optional: for torus inner radius
          "tube": 0.1            // Optional: for torus tube thickness
        }
      ]
    }

    CRITICAL GUIDELINES:
    1. Use 50-100 primitives minimum for rich detail
    2. Vary primitive sizes (large structural + small detail elements)
    3. Sample colors precisely from the image (use multiple shades)
    4. Layer primitives for depth and realism
    5. Use appropriate shapes (cones for tapered parts, capsules for smooth rounded shapes, etc.)
    6. Add small decorative/detail primitives (screws, joints, textures)
    
    Focus on creating a recognizable, detailed 3D representation.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a JSON-only API. Output only valid JSON data."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                "url": imageUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 4000, // Increased for 50-100 primitives
            response_format: { type: "json_object" }
        });

        const raw = response.choices[0].message.content;
        console.log("OpenAI Raw Response:", raw); // Debug Log

        if (!raw) throw new Error("No content from OpenAI");

        // Cleanup potential markdown fences if GPT ignores system prompt
        const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(cleanJson);

        // Handle Wrapper Key
        if (parsed.primitives && Array.isArray(parsed.primitives)) {
            return parsed.primitives as Primitive[];
        }

        // Fallback for direct array (unlikely with json_object mode but possible)
        if (Array.isArray(parsed)) return parsed as Primitive[];

        console.warn("Unexpected JSON structure:", raw);
        return [];
    } catch (e) {
        console.error("OpenAI 3D Gen failed:", e);
        throw e;
    }
}
