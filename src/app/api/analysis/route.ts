import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { AnalyzeAnswerSchema } from "@/lib/domain/schemas";
import { buildAnalysisContext } from "@/lib/ai/prompts";

// Initialize GenAI Client
// NOTE: Make sure GEMINI_API_KEY is in .env.local
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: Request) {
    if (!ai) {
        return NextResponse.json(
            { error: "Server Configuration Error: Missing API Key" },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();

        // Validate Input
        const parseResult = AnalyzeAnswerSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parseResult.error.format() },
                { status: 400 }
            );
        }

        const { question, input, blueprint, intakeData } = parseResult.data;

        // Construct Prompt
        const systemPrompt = buildAnalysisContext(question, blueprint, intakeData);

        // Prepare Content
        let contentParts = [];
        if (typeof input === "string") {
            contentParts.push({ text: `User's Answer: "${input}"` });
        } else {
            // Handle Audio logic later (requires blob handling)
            return NextResponse.json({ error: "Audio not yet supported" }, { status: 501 });
        }

        contentParts.push({ text: systemPrompt });

        // Generate
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp', // Or generic-flash
            contents: { parts: contentParts },
            config: {
                responseMimeType: 'application/json',
                // In a real implementation, we would define the full JSON schema here
                // For V1, we rely on the prompt instructions + json mode
            },
        });

        const text = response.text;
        if (!text) throw new Error("No output from AI");

        return NextResponse.json(JSON.parse(text));

    } catch (error) {
        console.error("Analysis Error:", error);
        return NextResponse.json(
            { error: "Analysis Failed" },
            { status: 500 }
        );
    }
}
