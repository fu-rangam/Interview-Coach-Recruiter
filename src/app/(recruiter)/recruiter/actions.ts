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
        const allSessions = await sessionRepo.listByRecruiter(user.id);

        // Consolidate lineage
        const rootMap = new Map<string, SessionSummary>();
        const children: SessionSummary[] = [];

        allSessions.forEach(s => {
            if (!s.parentSessionId) {
                rootMap.set(s.id, { ...s, attempts: [] });
            } else {
                children.push(s);
            }
        });

        // Handle children whose roots haven't been processed or found
        children.forEach(c => {
            const root = rootMap.get(c.parentSessionId!);
            if (root) {
                // Fallback candidate name if child is anonymous
                if (c.candidateName === "Anonymous Candidate") {
                    c.candidateName = root.candidateName;
                }
                root.attempts = root.attempts || [];
                root.attempts.push(c);
            } else {
                // Fallback: This child has no root in the list, treat as its own root
                rootMap.set(c.id, { ...c, attempts: [] });
            }
        });

        // Sort root sessions by creation date
        return Array.from(rootMap.values())
            .map(r => ({
                ...r,
                attempts: r.attempts?.sort((a, b) => (a.attemptNumber || 0) - (b.attemptNumber || 0))
            }))
            .sort((a, b) => b.createdAt - a.createdAt);
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
