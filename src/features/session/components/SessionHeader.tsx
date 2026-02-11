import React from 'react';
import { useSession } from '../context/SessionContext';
import { cn } from '@/lib/cn';

export function SessionHeader() {
    const { session, goToQuestion } = useSession();
    if (!session) return null;
    const { questions, currentQuestionIndex, answers } = session;

    return (
        <header className="border-b bg-slate-50 dark:bg-neutral-900 flex justify-center items-center sticky top-0 z-20 shrink-0 h-[60px]">
            {/* Question Navigator - Matches UnifiedSessionScreen padding (p-4 md:p-6) */}
            <div className="w-full max-w-5xl mx-auto px-4 md:px-6 relative h-full flex items-center">
                {/* Connecting Line - Darker for visibility */}
                <div className="absolute top-1/2 left-4 md:left-6 right-4 md:right-6 h-[1px] bg-slate-200 dark:bg-neutral-600 -translate-y-1/2 z-0" aria-hidden="true" />

                <div className="flex justify-between items-center relative z-10 w-full">
                    {questions.map((q, idx) => {
                        const isCurrent = idx === currentQuestionIndex;
                        const isAnswered = !!answers[q.id]?.submittedAt;
                        // Logic: Can jump to any answered question OR the first unanswered one
                        const firstUnansweredIdx = questions.findIndex(qu => !answers[qu.id]?.submittedAt);
                        const maxClickable = firstUnansweredIdx === -1 ? questions.length - 1 : firstUnansweredIdx;
                        const isClickable = idx <= maxClickable;

                        return (
                            <button
                                key={q.id}
                                onClick={() => { if (isClickable) goToQuestion(idx); }}
                                disabled={!isClickable}
                                className={cn(
                                    "relative flex items-center justify-center transition-all duration-200 text-sm border-2", // Removed font-medium/bold
                                    // Active State: "Question #" - Blue Pills
                                    isCurrent
                                        ? "px-4 py-1 rounded-full bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                                        : "w-8 h-8 rounded-full", // Circle for others

                                    // Answered State: Green Circles (Border matches BG)
                                    !isCurrent && isAnswered
                                        ? "bg-emerald-100 border-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:border-emerald-200"
                                        : "",

                                    // Future/Unanswered State: Muted Neutrals (Darker, Border matches BG)
                                    !isCurrent && !isAnswered
                                        ? isClickable
                                            ? "bg-slate-200 border-slate-200 text-slate-600 hover:bg-slate-300 hover:border-slate-300" // Darker than slate-100
                                            : "bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed"
                                        : ""
                                )}
                            >
                                {isCurrent ? (
                                    <span className="text-xs tracking-tight">Question {idx + 1}</span> // Removed font-bold
                                ) : (
                                    <span className="text-xs">{idx + 1}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}
