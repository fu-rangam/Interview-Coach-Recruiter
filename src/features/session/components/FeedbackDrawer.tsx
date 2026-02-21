import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AnalysisResult } from '@/lib/domain/types';
import {
    ArrowRight,
    Play,
    Pause,
    RotateCcw,
    Sparkles,
    Users,
    ShieldCheck,
    GitBranch,
    Box
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface FeedbackOverlayProps {
    isOpen: boolean;
    analysis?: AnalysisResult;
    isThinking?: boolean;
    onNext: () => void;
    onRetry: () => void;
    onStop?: () => void;
    isLastQuestion?: boolean;
    transcript?: string;
    audioBlob?: Blob | null;
}

export const FeedbackDrawer: React.FC<FeedbackOverlayProps> = ({
    isOpen,
    analysis,
    isThinking,
    onNext,
    onRetry,
    isLastQuestion,
    transcript,
    audioBlob
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlayback = () => {
        if (!audioBlob) return;

        if (!audioRef.current) {
            const url = URL.createObjectURL(audioBlob);
            audioRef.current = new Audio(url);
            audioRef.current.onended = () => setIsPlaying(false);
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlaying(false);
        }
    }, [audioBlob]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Card Mapping Logic
    const isPrimaryFocus = (dimension: string) => analysis?.primaryFocus?.dimension === dimension;

    const getCardState = (dimensions: string[]) => {
        const primary = dimensions.find(d => isPrimaryFocus(d));
        return {
            isFocus: !!primary,
            label: primary ? "Focus Area" : "Strength"
        };
    };

    const isTextMode = analysis?.meta?.modality === 'text';

    // Simple comment generator (~10 words)
    const getComment = (id: string, isFocus: boolean) => {
        if (isFocus) {
            switch (id) {
                case 'presence': return "Refining your delivery will make your answer feel more engaging.";
                case 'confidence': return "Working on steady delivery will help you sound more self-assured.";
                case 'logic': return "A more structured approach will help the listener follow along.";
                case 'material': return "Adding specific outcomes will make your achievements more concrete.";
                default: return "There's an opportunity to strengthen this area further.";
            }
        } else {
            switch (id) {
                case 'presence': return "You sounded engaged and reached the listener effectively.";
                case 'confidence': return "You projected strong poise and self-assurance throughout.";
                case 'logic': return "Your answer followed a clear, logical, and organized flow.";
                case 'material': return "You used specific examples that successfully demonstrated your impact.";
                default: return "You demonstrated strong capability in this specific area.";
            }
        }
    };

    const deliveryCards = [
        {
            id: 'presence',
            title: isTextMode ? "Engagement" : "Presence",
            icon: Users,
            dimensions: ['delivery_control', 'focus_relevance']
        },
        {
            id: 'confidence',
            title: "Confidence",
            icon: ShieldCheck,
            dimensions: [] // Special case for meta.confidence
        }
    ];

    const contentCards = [
        {
            id: 'logic',
            title: "Logic",
            icon: GitBranch,
            dimensions: ['structural_clarity', 'decision_rationale']
        },
        {
            id: 'material',
            title: "Material",
            icon: Box,
            dimensions: ['outcome_explicitness', 'specificity_concreteness']
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl max-h-[95vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5 flex flex-col overflow-hidden"
                    >
                        <div className="p-8 md:p-12 pb-8 flex flex-col gap-4 items-start border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-center justify-between w-full">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest leading-none">
                                    <Sparkles size={14} />
                                    <span>Evaluation Overview</span>
                                </div>
                                {/* DEV-ONLY: Exposed Readiness Level for verification */}
                                {analysis?.meta?.readinessLevel && (
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none opacity-50">
                                        Debug: {analysis.meta.readinessLevel}
                                    </div>
                                )}
                            </div>
                            <h2 className="text-2xl md:text-[2.25rem] font-bold text-slate-900 dark:text-white leading-[1.2] font-display w-full">
                                {analysis?.ack || "Thinking..."}
                            </h2>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
                            {/* Row 2: Grid & Transcript */}
                            <div className="px-8 md:px-12 py-8 grid grid-cols-1 md:grid-cols-[1.2fr,1fr] gap-10 items-stretch">
                                {/* Left Column: Feedback Grid */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Speaking Delivery</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {deliveryCards.map((card) => {
                                                let state = getCardState(card.dimensions);
                                                if (card.id === 'confidence') {
                                                    const lowConfidence = analysis?.meta?.confidence === 'low';
                                                    state = { isFocus: lowConfidence, label: lowConfidence ? "Focus Area" : "Strength" };
                                                }
                                                return (
                                                    <div key={card.id} className={cn("p-5 rounded-[2rem] border transition-all", state.isFocus ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200" : "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200")}>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <card.icon size={18} className={state.isFocus ? "text-amber-600" : "text-emerald-600"} />
                                                            <h3 className="font-bold text-slate-800 dark:text-white capitalize text-sm">{card.title}</h3>
                                                            <span className={cn("text-[9px] font-black uppercase tracking-tight ml-auto", state.isFocus ? "text-amber-600" : "text-emerald-600")}>{state.label}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{getComment(card.id, state.isFocus)}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Answer Content</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {contentCards.map((card) => {
                                                const state = getCardState(card.dimensions);
                                                return (
                                                    <div key={card.id} className={cn("p-5 rounded-[2rem] border transition-all", state.isFocus ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200" : "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200")}>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <card.icon size={18} className={state.isFocus ? "text-amber-600" : "text-emerald-600"} />
                                                            <h3 className="font-bold text-slate-800 dark:text-white capitalize text-sm">{card.title}</h3>
                                                            <span className={cn("text-[9px] font-black uppercase tracking-tight ml-auto", state.isFocus ? "text-amber-600" : "text-emerald-600")}>{state.label}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{getComment(card.id, state.isFocus)}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Transcript (Syncs to Grid Column height) */}
                                <div className="flex flex-col space-y-4 overflow-hidden">
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Your Transcript</h4>
                                        {audioBlob && !isThinking && (
                                            <button
                                                onClick={togglePlayback}
                                                className={cn(
                                                    "inline-flex items-center gap-2 px-2.5 py-1 rounded-lg transition-all text-[10px] font-black uppercase tracking-tight leading-none",
                                                    isPlaying
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                                )}
                                            >
                                                {isPlaying ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
                                                <span>{isPlaying ? "Playing" : "Listen"}</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 relative min-h-[200px] md:min-h-0">
                                        <div className="md:absolute md:inset-0 p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-y-auto italic scrollbar-hide">
                                            <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                                                &quot;{transcript || "No transcript available."}&quot;
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Evidence & Recommendation */}
                            <div className="px-8 md:px-12 pb-12 pt-4 grid grid-cols-1 md:grid-cols-[1.2fr,1fr] gap-10 items-stretch">
                                {/* Evidence Column */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Specific Evidence</h4>
                                    <ul className="grid grid-cols-1 gap-2">
                                        {analysis?.observations?.map((obs, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 leading-snug">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                                                <span>{obs}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Recommendation Column */}
                                <div className="flex flex-col space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">My Recommendation</h4>
                                    <div className="flex-1 p-8 bg-blue-600/5 dark:bg-blue-100/5 border border-blue-200 dark:border-blue-500/10 rounded-[2.5rem] flex flex-col justify-between items-stretch">
                                        {analysis?.primaryFocus ? (
                                            <div className="space-y-2 mb-6">
                                                <h5 className="font-bold text-lg text-blue-900 dark:text-blue-100">{analysis.primaryFocus.headline}</h5>
                                                <p className="text-blue-900/80 dark:text-blue-100/70 text-sm leading-relaxed">{analysis.primaryFocus.body}</p>
                                            </div>
                                        ) : (
                                            <div className="flex-1" />
                                        )}

                                        <div className="space-y-3">
                                            <Button
                                                onClick={onRetry}
                                                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30 text-white font-bold gap-3 group"
                                            >
                                                <RotateCcw size={18} className="group-hover:rotate-[-45deg] transition-transform" />
                                                <span>{analysis?.nextAction?.label || "Refine this answer"}</span>
                                            </Button>

                                            <Button
                                                onClick={onNext}
                                                variant="outline"
                                                className="w-full h-12 rounded-2xl border-slate-200 dark:border-white/10 text-slate-600 dark:text-white font-bold gap-2"
                                            >
                                                <span>{isLastQuestion ? "Finish Session" : "Continue to Next Question"}</span>
                                                <ArrowRight size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
