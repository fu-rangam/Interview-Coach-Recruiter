import { NextResponse } from "next/server";
import { TTSService } from "@/lib/server/services/tts-service";

// export const runtime = 'edge'; // Optional: Use edge if compatible, otherwise default to node
// GenAI SDK might rely on Node built-ins, so keeping standard runtime for safety initially.

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json({ error: "Missing text" }, { status: 400 });
        }

        const { audioData, mimeType } = await TTSService.generateSpeech(text);

        return new NextResponse(audioData, {
            headers: {
                'Content-Type': mimeType,
                'Content-Length': audioData.length.toString(),
            }
        });

    } catch (error: any) {
        console.error("TTS API Error:", error);
        return NextResponse.json({ error: error.message || "TTS Failed" }, { status: 500 });
    }
}
