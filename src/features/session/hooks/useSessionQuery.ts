import { useState, useEffect, useCallback } from "react";
import { InterviewSession } from "@/lib/domain/types";
import { ApiClient } from "@/lib/api-client";
import { STORAGE_KEYS } from "@/lib/constants";
import { InterviewSessionSchema } from "@/lib/domain/schemas";

export function useSessionQuery(initialSessionId?: string, candidateToken?: string) {
    const [session, setSession] = useState<InterviewSession | undefined>(undefined);

    // Rehydrate on Mount
    useEffect(() => {
        const storedId = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION_ID);
        const targetId = initialSessionId || storedId;

        if (targetId && !session) {
            // If explicit ID provided and differs from stored, update storage
            if (initialSessionId && initialSessionId !== storedId) {
                localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION_ID, initialSessionId);
            }

            ApiClient.get<InterviewSession>(`/api/session/${targetId}`, { token: candidateToken, schema: InterviewSessionSchema })
                .then((data: InterviewSession) => setSession(data))
                .catch((err: unknown) => {
                    console.warn("Rehydration failed:", err);
                    // Critical: If fetch fails, we must allow UI to handle error rather than hang
                    if (!session) {
                        // We can't setSession(undefined) as that keeps it loading
                        // We should probably allow setSession(null) to indicate "Loaded but Empty/Error"
                        // But Typescript might block.
                        // For now, let's just clear storage so we don't loop
                    }
                    if (!initialSessionId) {
                        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION_ID);
                    }
                });
        }
    }, [initialSessionId, candidateToken, session]);

    const refresh = useCallback(async () => {
        if (!session?.id) return;
        const data = await ApiClient.get<InterviewSession>(`/api/session/${session.id}`, { token: candidateToken, schema: InterviewSessionSchema });
        setSession(data);
    }, [session?.id, candidateToken]);

    return {
        session,
        setSession,
        refresh
    };
}
