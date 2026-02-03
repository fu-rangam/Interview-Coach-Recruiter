import { InterviewSession } from "@/lib/domain/types";

// Canonical Screen IDs (Matches SCREEN_STATE_MODEL.md)
export type ScreenId =
    | "INITIALS"
    | "LANDING"
    | "ACTIVE_QUESTION"
    | "PENDING_EVALUATION"
    | "REVIEW_FEEDBACK"
    | "SUMMARY"
    | "ERROR";

// The "Now" View Projection
export interface NowState {
    isLoaded: boolean;
    status: InterviewSession["status"];
    role?: string;

    // Derived Flags
    requiresInitials: boolean;
    canStart: boolean;
    isComplete: boolean;

    // Active Context
    currentQuestionId?: string;
    currentQuestionIndex: number;
    totalQuestions: number;

    // Computed Screen
    screen: ScreenId;
}
