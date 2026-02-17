import { useCallback, useRef, useMemo, Dispatch, SetStateAction } from "react";
import { InterviewSession } from "@/lib/domain/types";
import { selectNow } from "@/lib/state/selectors";
import { STORAGE_KEYS, SESSION_STATUS } from "@/lib/constants";
import { ApiClient } from "@/lib/api-client";
import { InterviewSessionSchema } from "@/lib/domain/schemas";
import { Logger } from "@/lib/logger";

export function useSessionMutations(
    session: InterviewSession | null | undefined,
    setSession: Dispatch<SetStateAction<InterviewSession | null | undefined>>,
    candidateToken?: string
) {
    const now = useMemo(() => selectNow(session), [session]);
    const isBusyRef = useRef(false);



    const init = useCallback(async (role: string, parentId?: string) => {
        if (isBusyRef.current) return;
        isBusyRef.current = true;
        try {
            const { data: newSession, headers } = await ApiClient.postWithHeaders<InterviewSession>(
                '/api/session/start',
                { role, parentId },
                { schema: InterviewSessionSchema }
            );
            setSession(newSession);
            localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION_ID, newSession.id);

            const newToken = headers.get('x-candidate-token');
            return { sessionId: newSession.id, candidateToken: newToken };
        } catch (e) {
            Logger.error("Session Init Failed", e);
            throw e;
        } finally {
            isBusyRef.current = false;
        }
    }, [setSession]);

    const start = useCallback(async () => {
        if (!session) return;
        if (isBusyRef.current) return;
        isBusyRef.current = true;

        try {
            setSession((prev: InterviewSession | null | undefined) => prev ? { ...prev, status: "IN_SESSION" } : undefined);

            await ApiClient.patch(`/api/session/${session.id}`, { status: "IN_SESSION" }, { token: candidateToken, schema: InterviewSessionSchema });
        } finally {
            isBusyRef.current = false;
        }
    }, [session, candidateToken, setSession]);

    const analyzeCurrentQuestion = useCallback(async (audioData?: { base64: string; mimeType: string }) => {
        if (!session || !now.currentQuestionId) return;

        try {
            const updated = await ApiClient.post<InterviewSession>(
                `/api/session/${session.id}/questions/${now.currentQuestionId}/analysis`,
                { audioData },
                { token: candidateToken, schema: InterviewSessionSchema }
            );
            setSession(updated);
        } catch (e) {
            console.error("Analysis trigger failed:", e);
        }
    }, [session, now.currentQuestionId, candidateToken, setSession]);

    const submit = useCallback(async (answerText: string, audioBlob?: Blob | null) => {
        if (!session || !now.currentQuestionId) return;
        if (isBusyRef.current) return;
        isBusyRef.current = true;

        try {
            // Optimistic Update: Immediately transition to AWAITING_EVALUATION to show loader
            setSession((prev: InterviewSession | null | undefined) => {
                if (!prev) return undefined;
                const qid = now.currentQuestionId!;
                return {
                    ...prev,
                    status: "AWAITING_EVALUATION",
                    answers: {
                        ...prev.answers,
                        [qid]: {
                            ...prev.answers[qid],
                            questionId: qid,
                            transcript: answerText,
                            submittedAt: Date.now(),
                            analysis: undefined,
                            draft: undefined
                        }
                    }
                };
            });

            // But for V1, let's wait for the response to ensure persistence.
            const updated = await ApiClient.post<InterviewSession>(
                `/api/session/${session.id}/questions/${now.currentQuestionId}/submit`,
                { text: answerText },
                { token: candidateToken, schema: InterviewSessionSchema }
            );

            Logger.info("Submit success", { updatedStatus: updated.status });
            setSession(updated);

            // Prepare audio data if present
            let audioData: { base64: string; mimeType: string } | undefined;
            if (audioBlob) {
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => {
                        const base64String = (reader.result as string).split(',')[1];
                        resolve(base64String);
                    };
                });
                reader.readAsDataURL(audioBlob);
                const base64 = await base64Promise;
                audioData = { base64, mimeType: audioBlob.type };
            }

            // Trigger Analysis immediately after persistence
            await analyzeCurrentQuestion(audioData);
        } catch (e) {
            Logger.error("Submit failed with exception", e);
            // Ideally rollback logic here
        } finally {
            isBusyRef.current = false;
        }
    }, [session, now.currentQuestionId, candidateToken, setSession, analyzeCurrentQuestion]);

    const submitInitials = useCallback(async (initials: string) => {
        if (!session) return;

        // Optimistic
        setSession((prev: InterviewSession | null | undefined) => prev ? {
            ...prev,
            enteredInitials: initials,
            initialsRequired: false
        } : undefined);

        await ApiClient.patch(
            `/api/session/${session.id}`,
            { enteredInitials: initials, initialsRequired: false },
            { token: candidateToken, schema: InterviewSessionSchema }
        );
    }, [session, candidateToken, setSession]);

    const saveDraft = useCallback(async (text: string) => {
        if (!session || !now.currentQuestionId) return;

        // Optimistic: Update local session 'answers' map
        setSession((prev: InterviewSession | null | undefined) => {
            if (!prev) return undefined;
            const qid = now.currentQuestionId!;
            const currentAns = prev.answers[qid] || {};

            return {
                ...prev,
                answers: {
                    ...prev.answers,
                    [qid]: {
                        ...currentAns,
                        questionId: qid,
                        draft: text
                    }
                }
            };
        });

        const url = `/api/session/${session.id}/questions/${now.currentQuestionId}/answer`;
        // console.log(`[useDomainSession] saveDraft -> PUT ${url}`);

        // We expect { success: true }, not the full session.
        // Remove schema validation for this call.
        await ApiClient.put<{ success: boolean }>(url, { text, isFinal: false }, { token: candidateToken })
            .catch(e => console.error("[useDomainSession] saveDraft Error:", e));
    }, [session, now.currentQuestionId, candidateToken, setSession]);

    const next = useCallback(async () => {
        if (!session) return;
        if (isBusyRef.current) return;
        isBusyRef.current = true;

        try {
            const nextIdx = session.currentQuestionIndex + 1;
            const isComplete = nextIdx >= session.questions.length;
            const nextStatus = isComplete ? SESSION_STATUS.COMPLETED : SESSION_STATUS.IN_SESSION;

            // Optimistic
            setSession((prev: InterviewSession | null | undefined) => prev ? {
                ...prev,
                currentQuestionIndex: nextIdx,
                status: nextStatus
            } : undefined);

            await ApiClient.patch(
                `/api/session/${session.id}`,
                {
                    currentQuestionIndex: nextIdx,
                    status: nextStatus
                },
                { token: candidateToken, schema: InterviewSessionSchema }
            );
        } finally {
            isBusyRef.current = false;
        }
    }, [session, candidateToken, setSession]);

    const retry = useCallback(async (retryContext?: { trigger: 'user' | 'coach'; focus?: string }) => {
        if (!session || !now.currentQuestionId) return;
        const qid = now.currentQuestionId;

        // Optimistic
        setSession((prev: InterviewSession | null | undefined) => {
            if (!prev) return undefined;

            const currentAns = prev.answers[qid];
            if (!currentAns) return prev;

            return {
                ...prev,
                status: SESSION_STATUS.IN_SESSION, // Force back to session mode
                answers: {
                    ...prev.answers,
                    [qid]: {
                        ...currentAns,
                        submittedAt: undefined,
                        analysis: undefined,
                        retryContext: retryContext // Store context optimistically
                        // transcript (draft) remains
                    }
                }
            };
        });

        // Server Persist: We need to clear these fields.
        await ApiClient.post(
            `/api/session/${session.id}/questions/${qid}/retry`,
            { retryContext },
            { token: candidateToken, schema: InterviewSessionSchema }
        );
    }, [session, now.currentQuestionId, candidateToken, setSession]);

    const goToQuestion = useCallback(async (index: number) => {
        if (!session) return;

        // Validation: Can only go to questions up to the first unanswered one (furthest progress)
        let maxAllowed = 0;
        for (let i = 0; i < session.questions.length; i++) {
            const q = session.questions[i];
            const ans = session.answers[q.id];
            if (ans?.submittedAt) {
                maxAllowed = i + 1;
            } else {
                maxAllowed = i;
                break;
            }
        }

        if (session.answers[session.questions[session.questions.length - 1].id]?.submittedAt) {
            maxAllowed = session.questions.length - 1;
        }

        if (index < 0 || index > maxAllowed) {
            console.warn(`[useDomainSession] goToQuestion blocked: ${index} > ${maxAllowed}`);
            return;
        }

        // Optimistic
        setSession((prev: InterviewSession | null | undefined) => prev ? {
            ...prev,
            currentQuestionIndex: index,
            status: SESSION_STATUS.IN_SESSION
        } : undefined);

        await ApiClient.patch(
            `/api/session/${session.id}`,
            { currentQuestionIndex: index },
            { token: candidateToken, schema: InterviewSessionSchema }
        );
    }, [session, candidateToken, setSession]);

    const updateSession = useCallback(async (updates: Partial<InterviewSession>) => {
        if (!session) return;

        // Optimistic
        setSession((prev: InterviewSession | null | undefined) => prev ? { ...prev, ...updates } : undefined);

        await ApiClient.patch(`/api/session/${session.id}`, updates, { token: candidateToken, schema: InterviewSessionSchema });
    }, [session, candidateToken, setSession]);

    const reset = useCallback(async () => {
        if (!session) return;

        // Optimistic: Clear answers, reset index, status IN_SESSION
        setSession((prev: InterviewSession | null | undefined) => prev ? {
            ...prev,
            status: SESSION_STATUS.IN_SESSION,
            currentQuestionIndex: 0,
            answers: {} // Clear all answers
        } : undefined);

        await ApiClient.post(`/api/session/${session.id}/reset`, {}, { token: candidateToken, schema: InterviewSessionSchema });
    }, [session, candidateToken, setSession]);

    return {
        init,
        start,
        submit,
        submitInitials,
        saveDraft,
        next,
        retry,
        goToQuestion,
        analyzeCurrentQuestion,
        updateSession,
        reset
    };
}
