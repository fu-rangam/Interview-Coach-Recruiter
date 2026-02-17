import { NextResponse } from "next/server";
import { createSession, addQuestions, cloneSession } from "@/lib/server/session/orchestrator";
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

        const input = parseResult.data;
        let session;

        // 2. Orchestration (Clone or Create)
        if (input.parentId) {
            // CLONE FLOW
            const parentSession = await repository.get(input.parentId);
            if (!parentSession) {
                return NextResponse.json({ error: "Parent session not found" }, { status: 404 });
            }
            session = cloneSession(parentSession);
            // Questions are now cloned with new IDs inside cloneSession
        } else {
            // NEW SESSION FLOW
            session = createSession(input);
            // Service Logic (Question Generation)
            const questions = await QuestionService.generateQuestions(session.role || "General");
            session = addQuestions(session, questions);
        }

        // 3. Persistence
        await repository.create(session);

        // 4. Auth Token Issuance
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
