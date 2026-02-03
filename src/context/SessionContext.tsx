"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { InterviewSession, AnalysisResult } from '@/lib/domain/types';
import { NowState, ScreenId } from '@/lib/state/now.types';
import { useDomainSession } from '@/hooks/useDomainSession';

// --- Types (Stubs or Imports) ---
export interface OnboardingIntakeV1 {
    [key: string]: any;
}

export interface SessionContextType {
    // Legacy State (Mapped to Core where possible)
    session?: InterviewSession;
    startSession: (
        role: string,
        jobDescription?: string,
        intakeData?: OnboardingIntakeV1
    ) => Promise<void>;
    nextQuestion: () => void;
    goToQuestion: (index: number) => void;
    isLoading: boolean;

    // Stubs for legacy signature compatibility
    loadTipsForQuestion: (questionId: string) => Promise<void>;
    saveAnswer: (
        questionId: string,
        answer: { audioBlob?: Blob; text?: string; analysis: AnalysisResult | null }
    ) => void;
    clearAnswer: (questionId: string) => void;
    updateAnswerAnalysis: (questionId: string, partialAnalysis: Partial<AnalysisResult>) => void;
    finishSession: () => Promise<void>;
    resetSession: () => void;
    audioUrls: Record<string, string>;
    cacheAudioUrl: (questionId: string, url: string) => void;
    updateSession: (sessionId: string, updates: Partial<InterviewSession>) => Promise<void>;

    // Headless Core State (The New Truth)
    now: NowState;
    screen: ScreenId;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // The Core Hook manages the state
    const { session, now, actions } = useDomainSession();

    // Bootstrap on mount
    useEffect(() => {
        if (!now.isLoaded) {
            actions.init("Product Manager");
        }
    }, [now.isLoaded, actions]);

    // Adapter Logic
    const startSession = async (role: string, jobDescription?: string, intakeData?: OnboardingIntakeV1) => {
        // Transition to IN_SESSION
        actions.start();
    };

    const nextQuestion = () => {
        actions.next();
    };

    const saveAnswer = (qid: string, ans: any) => {
        if (ans.text) actions.submit(ans.text);
    };

    // Stubs
    const goToQuestion = (index: number) => console.log("goToQuestion not impl in V1");
    const loadTipsForQuestion = async () => console.log("loadTips not impl in V1");
    const clearAnswer = () => console.log("clearAnswer not impl");
    const updateAnswerAnalysis = () => console.log("updateAnswerAnalysis not impl");
    const finishSession = async () => console.log("finishSession handled by Orchestrator");
    const resetSession = () => console.log("resetSession not impl");
    const cacheAudioUrl = () => { };
    const updateSession = async () => { };

    const contextValue: SessionContextType = {
        session,
        now,
        screen: now.screen,
        startSession,
        nextQuestion,
        goToQuestion,
        isLoading: !now.isLoaded,
        loadTipsForQuestion,
        saveAnswer,
        clearAnswer,
        updateAnswerAnalysis,
        finishSession,
        resetSession,
        audioUrls: {}, // No audio in V1
        cacheAudioUrl,
        updateSession
    };

    return (
        <SessionContext.Provider value={contextValue}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
