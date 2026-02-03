export type SessionStatus =
    | 'NOT_STARTED'
    | 'GENERATING_QUESTIONS'
    | 'IN_SESSION'
    | 'AWAITING_EVALUATION'
    | 'REVIEWING'
    | 'COMPLETED'
    | 'ERROR';

/**
 * Canonical Question Entity
 */
export interface Question {
    id: string;
    text: string;
    category: string; // e.g. "Behavioral", "Technical"
    framework?: string; // e.g. "STAR", "Problem-Solving"
    competencyId?: string;
    difficulty?: string;
    index: number; // 0-based index
    tips?: QuestionTips;
}

export interface QuestionTips {
    lookingFor: string;
    pointsToCover: string[];
    answerFramework: string;
    industrySpecifics: {
        metrics: string;
        tools: string;
    };
    mistakesToAvoid: string[];
    proTip: string;
}

/**
 * Canonical Answer Entity
 */
export interface Answer {
    questionId: string;
    transcript?: string; // Final text
    audioUrl?: string; // Optional audio ref
    submittedAt?: number;
    analysis?: AnalysisResult;
    draft?: string;
}

/**
 * Analysis Result (Model Output)
 */
export interface AnalysisResult {
    transcript?: string;
    feedback: string[];
    rating: string;
    answerScore?: number;
    deliveryStatus?: string;
    deliveryTips?: string[];
    keyTerms: string[];
    dimensionScores?: Array<{
        dimensionId: string;
        score: number;
        note: string;
    }>;
    evidenceExtracts?: string[];
    missingElements?: string[];
    biggestUpgrade?: string;
    redoPrompt?: string;
    coachReaction: string;
    strongResponse: string;
    whyThisWorks: {
        lookingFor: string;
        pointsToCover: string[];
        answerFramework: string;
        industrySpecifics: {
            metrics: string;
            tools: string;
        };
        mistakesToAvoid: string[];
        proTip: string;
    };
}

/**
 * Canonical Interview Session
 */
export interface InterviewSession {
    id: string;
    candidateName?: string;
    role: string;
    jobDescription?: string;
    status: SessionStatus;

    // The Data
    questions: Question[];
    currentQuestionIndex: number;
    answers: Record<string, Answer>; // Keyed by questionId

    // Minimal config truth
    initialsRequired: boolean;
}
