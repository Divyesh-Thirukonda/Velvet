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
    
    Output strictly valid JSON (no markdown block) which is an array of objects.
    Each object must have:
    - type: "box", "sphere", or "cylinder"
    - position: [x, y, z] (coordinates between -5 and 5)
    - scale: [width, height, depth] (sizes between 0.1 and 5)
    - rotation: [x, y, z] (in radians)
    - color: "#hexcode" (sample the dominant colors from the image part)

    Keep the composition simple but recognizable (approx 10-20 primitives).
    Focus on the main shape.
    Example output format:
    [{"type":"box","position":[0,0,0],"scale":[1,1,1],"rotation":[0,0,0],"color":"#ff0000"}]
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
        if (!raw) throw new Error("No content from OpenAI");

        // Handle potential "primitives" wrapper key if GPT adds one, or array directly
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as Primitive[];
        if (parsed.primitives && Array.isArray(parsed.primitives)) return parsed.primitives as Primitive[];

        // Fallback if structure is unexpected
        console.warn("Unexpected JSON structure:", raw);
        return [];
    } catch (e) {
        console.error("OpenAI 3D Gen failed:", e);
        throw e;
    }
}
