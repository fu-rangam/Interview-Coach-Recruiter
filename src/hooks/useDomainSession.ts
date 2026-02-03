import { useState, useMemo, useCallback } from "react";
import { InterviewSession } from "@/lib/domain/types";
import { createSession, startSession, nextQuestion, submitAnswer } from "@/lib/server/session/orchestrator";
import { selectNow } from "@/lib/state/selectors";

// NOTE: In a real app, this would wrap an API client or WebSocket.
// For V1 (local-first), it wraps the pure domain functions directly in React State.

export function useDomainSession() {
    const [session, setSession] = useState<InterviewSession | undefined>(undefined);

    // Computed Views
    const now = useMemo(() => selectNow(session), [session]);

    // Actions
    const init = useCallback(async (role: string) => {
        try {
            const response = await fetch('/api/session/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role })
            });

            if (!response.ok) throw new Error("Failed to start session");

            const newSession = await response.json();
            setSession(newSession);
        } catch (e) {
            console.error("Session Init Failed", e);
        }
    }, []);

    const start = useCallback(() => {
        if (!session) return;
        setSession(startSession(session));
    }, [session]);

    const submit = useCallback((answerText: string) => {
        if (!session || !now.currentQuestionId) return;
        setSession(submitAnswer(session, now.currentQuestionId, answerText));
    }, [session, now.currentQuestionId]);

    const next = useCallback(() => {
        if (!session) return;
        setSession(nextQuestion(session));
    }, [session]);

    return {
        session,
        now,
        actions: {
            init,
            start,
            submit,
            next
        }
    };
}
