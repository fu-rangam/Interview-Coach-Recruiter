import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from '../context/SessionContext';


import { Button } from '@/components/ui/button';

import AudioVisualizer from '@/features/audio/components/AudioVisualizer';
import { FeedbackDrawer } from '@/features/session/components/FeedbackDrawer';
import { SessionHeader } from '@/features/session/components/SessionHeader';
import { EngagementDebugOverlay } from '@/components/debug/EngagementDebugOverlay';
import { useSpeechToText } from "@/features/audio/hooks/useSpeechToText";
import { useAudioRecording } from "@/features/audio/hooks/useAudioRecording";
import { useTextToSpeech } from "@/features/audio/hooks/useTextToSpeech";
import { Mic, Loader2, Keyboard, ArrowRight, Volume2, StopCircle, Lightbulb, X, Sparkles } from 'lucide-react';
import { cn } from "@/lib/cn";
import { useSmartHints } from '../hooks/useSmartHints';
import { TipsAccordion } from './TipsAccordion';
import { StrongResponseAccordion } from './StrongResponseAccordion';
import { useStrongResponse } from '../hooks/useStrongResponse';
import { AnimatePresence, motion } from 'framer-motion';

export function UnifiedSessionScreen() {
    const {
        session,
        now,
        trackEvent,
        engagementDebugEvents,
        isEngagementWindowOpen,
        engagementWindowTimeRemaining,
        // Destructured actions
        saveDraft,
        saveAnswer,
        retryQuestion,
        nextQuestion
    } = useSession();

    const router = useRouter();

    const handleStop = async () => {
        if (window.confirm("Are you sure you want to stop? Your progress is saved.")) {
            trackEvent('tier2', 'session_stop_early');
            router.push('/dashboard');
        }
    };

    const { questions, currentQuestionIndex, answers, status } = session!;
    const currentQuestion = questions[currentQuestionIndex];
    // Safe access
    const answerData = answers[currentQuestion.id] || {};
    const analysis = answerData.analysis;

    // State for local UI
    const [answerText, setAnswerText] = useState("");
    const [mode, setMode] = useState<'voice' | 'text'>('voice');
    // const [isSaving, setIsSaving] = useState(false); // Unused
    const [showDebug, setShowDebug] = useState(false);
    const lastSaved = useRef("");

    // Hints
    const [hintOpen, setHintOpen] = useState(false);
    const { hints, isLoading: isHintLoading, fetchHints } = useSmartHints(currentQuestion, session?.role || "Candidate");

    // Strong Response Hook
    const {
        data: strongResponseData,
        isLoading: isStrongResponseLoading,
        fetchStrongResponse
    } = useStrongResponse(currentQuestion?.id || '', currentQuestion?.text || '', hints);

    const [strongResponseOpen, setStrongResponseOpen] = useState(false);

    // Audio Hooks
    const {
        // isListening, // Unused
        transcript,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeechToText();

    const {
        isRecording,
        isInitializing: isRecordingInitializing,
        startRecording,
        stopRecording,
        mediaStream
    } = useAudioRecording();

    const {
        speak,
        stop: stopSpeaking,
        isPlaying: isSpeaking,
        isLoading: isTTSLoading
    } = useTextToSpeech();

    // Derived States
    const isReviewing = status === 'REVIEWING' || status === 'AWAITING_EVALUATION';
    const isThinking = status === 'AWAITING_EVALUATION';
    const hasSubmitted = !!answerData.submittedAt;

    // --- Effects ---

    // Sync transcript to local state only if in voice mode
    // (Actually we keep them separate usually, but for submit we need to know which to use)

    // Auto-Save Draft
    useEffect(() => {
        const textToSave = mode === 'voice' ? transcript : answerText;
        // Simple debounce
        const timeout = setTimeout(() => {
            if (textToSave !== lastSaved.current && !hasSubmitted) {
                // setIsSaving(true);
                saveDraft(textToSave);
                lastSaved.current = textToSave;
                // setTimeout(() => setIsSaving(false), 800);
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [transcript, answerText, mode, hasSubmitted, saveDraft]);

    // Cleanup on unmount or question change
    useEffect(() => {
        setAnswerText("");
        resetTranscript();
        setHintOpen(false);
        setStrongResponseOpen(false);
        // Stop recording if active? Maybe safe to keep it simple
    }, [currentQuestion.id, resetTranscript]);


    // --- Handlers ---

    const handleToggleRecording = async () => {
        if (isRecording) {
            trackEvent('tier2', 'mic_stop');
            stopListening();
            await stopRecording();
        } else {
            trackEvent('tier2', 'mic_start');
            setAnswerText("");
            resetTranscript();
            startListening();
            await startRecording();
        }
    };

    const handleTogglePlayback = () => {
        console.log("[UnifiedSession] Toggle Playback", { isSpeaking });
        trackEvent('tier2', 'tts_toggle');
        if (isSpeaking) {
            stopSpeaking();
        } else {
            speak(currentQuestion.text);
        }
    };

    const handleSubmit = () => {
        const payload = mode === 'voice' ? transcript : answerText;
        if (!payload || payload.trim().length === 0) return;

        trackEvent('tier3', 'submit', 60);
        // Emulate saveAnswer usage as in Orchestrator
        saveAnswer(now.currentQuestionId || "", { text: payload, analysis: null });

        // Stop recording if active
        if (isRecording) {
            stopListening();
            stopRecording();
        }
    };

    const handleRetry = () => {
        // Reset local state
        setAnswerText("");
        resetTranscript();
        // Call action (resets status to IN_SESSION)
        const context = { trigger: 'user' as const, focus: 'general_improvement' };
        retryQuestion(context);
    };

    // Local drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Sync drawer open state with reviewing status
    useEffect(() => {
        if (isReviewing) setIsDrawerOpen(true);
    }, [isReviewing]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-neutral-900 relative">
            <SessionHeader />

            <main className="flex-1 p-4 md:p-6 gap-6 max-w-5xl mx-auto w-full flex flex-col">

                {/* 1. Question Card Area */}
                <div className={cn(
                    "transition-all duration-500 ease-in-out shrink-0",
                    isReviewing ? "opacity-40 scale-95 pointer-events-none" : "opacity-100 scale-100"
                )}>
                    {/* Question Content from ActiveQuestionScreen - CARD UI */}
                    <div className="bg-blue-600 text-white rounded-2xl p-6 md:p-10 shadow-xl w-full ring-1 ring-white/10 relative overflow-hidden transition-all duration-300">
                        {/* Header: Badge */}
                        <div className="flex justify-start mb-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm font-medium text-white backdrop-blur-sm capitalize">
                                {currentQuestion.category.toLowerCase()}
                            </span>
                        </div>

                        {/* Body: Question */}
                        <h2 className="text-2xl md:text-3xl font-medium leading-relaxed text-left mb-8">
                            {currentQuestion.text}
                        </h2>

                        {/* Footer: Controls */}
                        <div className="flex justify-between items-center min-h-[40px]">
                            {/* Left: Hint */}
                            <div>
                                {!hasSubmitted && !hintOpen && !strongResponseOpen && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                setHintOpen(true);
                                                if (!hints) fetchHints();
                                            }}
                                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-100 hover:text-white transition-colors"
                                        >
                                            <Lightbulb size={18} /> <span>Need a hint?</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setStrongResponseOpen(true);
                                                if (!strongResponseData) fetchStrongResponse();
                                            }}
                                            className="inline-flex items-center gap-2 text-sm font-medium text-purple-100 hover:text-white transition-colors"
                                        >
                                            <Sparkles size={18} /> <span>See Example</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Right: TTS */}
                            <button
                                onClick={handleTogglePlayback}
                                disabled={isTTSLoading}
                                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
                                aria-label={isSpeaking ? "Stop reading" : "Read question"}
                            >
                                {isSpeaking ? <StopCircle size={20} className="animate-pulse" /> : <Volume2 size={20} />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {hintOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden -mx-6 md:-mx-10 -mb-6 md:-mb-10"
                                >
                                    <div className="mt-8 bg-black/20 px-6 md:px-10 py-8 border-t border-white/10 relative">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-2 text-white font-semibold text-sm">
                                                <Lightbulb size={16} className="text-blue-200" /> <span>Interview Coach Tips</span>
                                            </div>
                                            <button
                                                onClick={() => setHintOpen(false)}
                                                className="p-1 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <TipsAccordion tips={hints} isLoading={isHintLoading} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Strong Response Accordion Area */}
                        <AnimatePresence>
                            {strongResponseOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden -mx-6 md:-mx-10 -mb-6 md:-mb-10"
                                >
                                    <div className="mt-8 bg-black/20 px-6 md:px-10 py-8 border-t border-white/10 relative">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-2 text-white font-semibold text-sm">
                                                <Sparkles size={16} className="text-blue-200" /> <span>Strong Response Example</span>
                                            </div>
                                            <button
                                                onClick={() => setStrongResponseOpen(false)}
                                                className="p-1 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <StrongResponseAccordion
                                            data={strongResponseData}
                                            isLoading={isStrongResponseLoading}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className={cn(
                    "flex-1 relative flex flex-col overflow-hidden transition-all duration-300",
                    !isReviewing && !hasSubmitted && mode === 'voice'
                        ? "bg-transparent border-none shadow-none"
                        : "bg-white rounded-2xl shadow-sm border border-slate-200"
                )}>
                    {/* Simplified Input Area */}
                    {!isReviewing && !hasSubmitted && (
                        <div className="flex-1 flex flex-col relative min-h-[420px]">
                            {/* ... Input Logic ... */}
                            {mode === 'voice' ? (
                                <div className="flex-1 flex flex-col items-center justify-center relative p-6">
                                    {/* Visualizer */}
                                    <div className="h-40 w-full max-w-md flex items-center justify-center mb-12">
                                        {isRecording ? (
                                            <AudioVisualizer
                                                stream={mediaStream}
                                                isRecording={isRecording}
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <div className="text-slate-300">
                                                <Volume2 size={48} className="opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] uppercase font-bold tracking-widest transition-colors duration-300 opacity-0"
                                    )}>
                                    </span>

                                    {/* Mic Button */}
                                    {/* ... */}
                                    {/* Mic Button Wrapper with Overlay */}
                                    <div className="relative w-48 h-48 flex justify-center items-center">
                                        {/* Standard Mic Button - Visible when recording or no transcript */}
                                        {(!transcript || isRecording) && (
                                            <button
                                                onClick={handleToggleRecording}
                                                disabled={isRecordingInitializing}
                                                className={cn(
                                                    "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-0",
                                                    isRecording
                                                        ? "bg-red-50 text-red-500 border-4 border-red-100"
                                                        : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
                                                )}
                                            >
                                                {isRecordingInitializing ? (
                                                    <Loader2 className="animate-spin w-8 h-8" />
                                                ) : (
                                                    <Mic size={32} className={cn(isRecording && "animate-pulse")} />
                                                )}
                                            </button>
                                        )}

                                        {/* Submit/Retry Overlay - Visible when finished recording */}
                                        {!isRecording && transcript && (
                                            <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center z-10 animate-in fade-in zoom-in duration-300">
                                                <Button
                                                    onClick={handleSubmit}
                                                    className="w-full shadow-xl bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                                                >
                                                    Submit Answer
                                                </Button>
                                                <Button
                                                    onClick={resetTranscript}
                                                    variant="outline"
                                                    className="w-full bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white text-slate-600"
                                                >
                                                    Retry
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-8 text-sm text-slate-500 font-medium animate-pulse">
                                        {isRecording ? "Listening..." : "Tap to Speak"}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex-1 p-6">
                                    <textarea
                                        className="w-full h-full resize-none outline-none text-lg text-slate-800 placeholder:text-slate-300 font-medium"
                                        placeholder="Type your answer here..."
                                        value={answerText}
                                        onChange={(e) => setAnswerText(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            )}

                            {/* Footer Controls */}
                            <div className={cn(
                                "p-4 border-t flex justify-between items-center transition-colors duration-300",
                                mode === 'voice' ? "bg-transparent border-t-white/10" : "bg-slate-50 border-t-slate-100"
                            )}>
                                <div className="bg-slate-100 p-1 rounded-full flex relative shadow-inner border border-slate-200">
                                    <button
                                        onClick={() => setMode('voice')}
                                        className={cn(
                                            "p-2 rounded-full transition-all text-slate-500 hover:text-slate-700",
                                            mode === 'voice' && "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                                        )}
                                        title="Voice Mode"
                                    >
                                        <Mic size={20} />
                                    </button>
                                    <button
                                        onClick={() => setMode('text')}
                                        className={cn(
                                            "p-2 rounded-full transition-all text-slate-500 hover:text-slate-700",
                                            mode === 'text' && "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                                        )}
                                        title="Text Mode"
                                    >
                                        <Keyboard size={20} />
                                    </button>
                                </div>

                                {mode === 'text' && (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!answerText.trim()}
                                    >
                                        Submit Answer <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Review Mode Placeholder (when submitted) */}
                    {(isReviewing || hasSubmitted) && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white">
                            <h3 className="text-lg font-medium text-slate-900">Answer Submitted</h3>
                            <div className="text-sm text-slate-500 italic max-w-md">
                                &quot;{answerData.transcript || "..."}&quot;
                            </div>

                            <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
                                <Button onClick={handleRetry} variant="outline" className="w-full">
                                    Try My Answer Again
                                </Button>
                                {/* Only show Continue button if we're not waiting for analysis or if we want to skip it */}
                                <Button onClick={() => nextQuestion()} className="w-full">
                                    Continue to Next Question
                                </Button>
                            </div>
                        </div>
                    )}
                </div>





                {/* Debug Overlay */}
                <EngagementDebugOverlay
                    isVisible={showDebug}
                    onClose={() => setShowDebug(false)}
                    tracker={{
                        totalEngagedSeconds: session?.engagedTimeSeconds || 0,
                        isWindowOpen: isEngagementWindowOpen,
                        trackEvent,
                        debugEvents: engagementDebugEvents,
                        windowTimeRemaining: engagementWindowTimeRemaining,
                        clearDebugEvents: () => { }
                    }}
                />
            </main >

            {/* Feedback Drawer - Moved outside main for overlay positioning */}
            <FeedbackDrawer
                isOpen={isReviewing && isDrawerOpen}
                analysis={analysis}
                isThinking={isThinking}
                onNext={() => {
                    // Stop any playback
                    if (isSpeaking) stopSpeaking();
                    nextQuestion();
                }}
                onRetry={handleRetry}
                onClose={() => setIsDrawerOpen(false)}
                onStop={handleStop}

                isLastQuestion={currentQuestionIndex >= questions.length - 1}
            />

            {/* Secret Debug Trigger - Bottom Left */}
            <button
                onClick={() => setShowDebug(true)}
                className="fixed bottom-0 left-0 w-16 h-16 opacity-0 z-50 cursor-default"
                aria-hidden="true"
                title="Debug"
            />
        </div >
    );
}

