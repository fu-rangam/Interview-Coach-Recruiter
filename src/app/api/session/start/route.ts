import { NextResponse } from "next/server";
import { createSession } from "@/lib/server/session/orchestrator";
import { InitSessionSchema } from "@/lib/domain/schemas";
import { InterviewSession } from "@/lib/domain/types";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate Input
        const parseResult = InitSessionSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parseResult.error.format() },
                { status: 400 }
            );
        }

        // Domain Logic
        // In a real app, this would also save to DB
        const session: InterviewSession = createSession(parseResult.data);

        // For V1 Demo: We add the mock questions HERE since the "createSession" in pure logic 
        // was empty by design (separation of concerns).
        session.questions = [
            { id: '1', text: 'Tell me about yourself.', category: 'Intro', index: 0 },
            { id: '2', text: 'What is your greatest weakness?', category: 'Behavioral', index: 1 }
        ];

        return NextResponse.json(session);
    } catch (error) {
        console.error("Session Start Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
