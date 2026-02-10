import { NextResponse } from "next/server";
import { createSession, addQuestions } from "@/lib/server/session/orchestrator";
import { QuestionService } from "@/lib/server/services/question-service";
import { SupabaseSessionRepository } from "@/lib/server/infrastructure/supabase-session-repository";
import { InitSessionSchema } from "@/lib/domain/schemas";
import { Logger } from "@/lib/logger";

const repository = new SupabaseSessionRepository();

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Validation
        const parseResult = InitSessionSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parseResult.error.format() },
                { status: 400 }
            );
        }

        // 2. Orchestration (Pure Domain)
        let session = createSession(parseResult.data);

        // 3. Service Logic (Question Generation)
        // Decoupled from API route -> delegated to service
        const questions = await QuestionService.generateQuestions(session.role || "General");
        session = addQuestions(session, questions);

        // 4. Persistence
        await repository.create(session);

        // 5. Auth Token Issuance
        const { issueCandidateToken } = await import("@/lib/server/auth/candidate-token");
        const token = await issueCandidateToken(session.id);

        const response = NextResponse.json(session);
        response.headers.set("x-candidate-token", token);
        return response;

    } catch (error) {
        Logger.error("Link Start Error", error);
        return NextResponse.json(
            { error: "Failed to start session" },
            { status: 500 }
        );
    }
}
