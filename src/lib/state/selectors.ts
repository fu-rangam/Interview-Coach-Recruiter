import { InterviewSession } from "@/lib/domain/types";
import { NowState, ScreenId } from "./now.types";

export function selectNow(session?: InterviewSession): NowState {
    if (!session) {
        return {
            isLoaded: false,
            status: "NOT_STARTED",
            requiresInitials: false,
            canStart: false,
            isComplete: false,
            currentQuestionIndex: 0,
            totalQuestions: 0,
            screen: "ERROR", // Default to safe error/loading state
        };
    }

    const { status, initialsRequired, candidateName, questions, currentQuestionIndex, answers } = session;

    const hasInitials = !!candidateName;
    const isComplete = status === "COMPLETED";
    const currentQ = questions[currentQuestionIndex];
    const currentAns = currentQ ? answers[currentQ.id] : undefined;

    // Screen Selection Logic (Deterministic Priority)
    let screen: ScreenId = "ERROR";

    if (status === "ERROR") {
        screen = "ERROR";
    } else if (initialsRequired && !hasInitials) {
        screen = "INITIALS";
    } else if (status === "NOT_STARTED") {
        screen = "LANDING";
    } else if (status === "COMPLETED") {
        screen = "SUMMARY";
    } else {
        // In-Session Logic
        if (status === "AWAITING_EVALUATION") {
            screen = "PENDING_EVALUATION";
        } else if (status === "REVIEWING") {
            screen = "REVIEW_FEEDBACK";
        } else {
            // Default to Active Question
            screen = "ACTIVE_QUESTION";
        }
    }

    return {
        isLoaded: true,
        status,
        role: session.role,
        requiresInitials: initialsRequired && !hasInitials,
        canStart: status === "NOT_STARTED",
        isComplete,
        currentQuestionId: currentQ?.id,
        currentQuestionIndex,
        totalQuestions: questions.length,
        screen,
    };
}
