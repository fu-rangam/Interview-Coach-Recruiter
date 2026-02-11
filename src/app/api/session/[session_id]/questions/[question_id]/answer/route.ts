import { NextResponse } from "next/server";
import { SupabaseSessionRepository } from "@/lib/server/infrastructure/supabase-session-repository";
import { z } from "zod";
import { requireCandidateToken } from "@/lib/server/auth/candidate-token";

const repository = new SupabaseSessionRepository();

const DraftSchema = z.object({
    text: z.string(),
    isFinal: z.boolean().optional() // For future use if we merge submit/draft
});

export async function PUT(
    request: Request,
    { params }: { params: { session_id: string; question_id: string } }
) {
    try {
        const auth = await requireCandidateToken(request, params.session_id);
        if (!auth.ok) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const body = await request.json();


        const { text } = DraftSchema.parse(body);

        // ATOMIC DRAFT SAVE (Fixes race condition with Submit/Analyze)
        // We do NOT fetch the whole session to avoid overwriting status with stale data.
        await repository.saveDraft(params.session_id, params.question_id, text);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Save Draft Failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
