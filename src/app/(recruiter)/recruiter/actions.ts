"use server";

import { getCachedUser } from "@/lib/supabase/server";
import { SupabaseSessionRepository } from "@/lib/server/infrastructure/supabase-session-repository";
import { redirect } from "next/navigation";
import { SessionSummary } from "@/lib/domain/types";
import { revalidatePath } from "next/cache";

const sessionRepo = new SupabaseSessionRepository();

export async function getRecruiterSessions(): Promise<SessionSummary[]> {
    const user = await getCachedUser();

    if (!user) {
        redirect("/login");
    }

    try {
        return await sessionRepo.listByRecruiter(user.id);
    } catch (error) {
        console.error("Failed to fetch sessions:", error);
        return [];
    }
}

export async function deleteSession(sessionId: string) {
    const user = await getCachedUser();
    if (!user) throw new Error("Unauthorized");

    try {
        await sessionRepo.delete(sessionId);
        revalidatePath("/recruiter");
    } catch (error) {
        console.error("Failed to delete session:", error);
        throw error;
    }
}
