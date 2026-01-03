// src/lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface Primitive {
    type: 'box' | 'sphere' | 'cylinder';
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color: string;
}

export async function generateGeometryFromImage(imageUrl: string): Promise<Primitive[]> {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI API Key missing");

    const prompt = `
    You are a 3D reconstruction engine. Analyze the provided image of a product and reconstructed it using a composition of basic geometric primitives (Box, Sphere, Cylinder).
    
    Output strictly valid JSON (no markdown block) with a root object containing a "primitives" key.
    
    Structure:
    {
      "primitives": [
        {
          "type": "box" | "sphere" | "cylinder",
          "position": [x, y, z], // Coordinates between -5 and 5
          "scale": [w, h, d],    // Sizes between 0.1 and 5
          "rotation": [x, y, z], // Radians
          "color": "#hexcode"    // Sampled from image
        }
      ]
    }

    Keep the composition simple but recognizable (approx 10-20 primitives).
    Focus on the main shape.
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
            max_tokens: 1500,
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
