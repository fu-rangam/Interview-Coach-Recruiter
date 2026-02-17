import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AnalysisResult } from '@/lib/domain/types';
import {
    CheckCircle2,
    ChevronDown,
    ArrowRight,
    Play,
    Pause,
    RotateCcw,
    Sparkles,
    MessageSquare,
    Mic
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
    onStop,
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
        // Clear audio element when blob changes (e.g. after retry)
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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                    />

                    {/* Content Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl max-h-[90vh] bg-background dark:bg-neutral-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-white/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600/10 text-blue-600 rounded-lg">
                                    <Sparkles size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Coaching Feedback</h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                            {/* Answer Review Section */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <MessageSquare size={14} />
                                        <span>Your Answer</span>
                                    </div>
                                    {audioBlob && (
                                        <button
                                            onClick={togglePlayback}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-semibold",
                                                isPlaying
                                                    ? "bg-blue-600 text-white shadow-lg"
                                                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100"
                                            )}
                                        >
                                            {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                                            {isPlaying ? "Playing..." : "Hear Delivery"}
                                        </button>
                                    )}
                                </div>
                                <div className="p-4 bg-slate-500/5 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                                    <p className="text-slate-800 dark:text-white/90 text-base leading-relaxed italic">
                                        &quot;{transcript || "Your answer text"}&quot;
                                    </p>
                                </div>
                            </section>

                            <div className="h-px bg-slate-200/50 dark:bg-white/5" />

                            {/* Analysis Section */}
                            {analysis ? (
                                <section className="space-y-8 animate-in fade-in duration-700">
                                    {/* Speaking Delivery */}
                                    {((analysis.deliveryTips && analysis.deliveryTips.length > 0) || analysis.deliveryStatus) && (
                                        <div className="bg-blue-600/5 dark:bg-blue-400/5 rounded-3xl border border-blue-200/50 dark:border-blue-500/10 p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                                    <Mic size={14} />
                                                    <span>Speaking Delivery</span>
                                                </div>
                                                {analysis.deliveryStatus && (
                                                    <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                                        {analysis.deliveryStatus}
                                                    </span>
                                                )}
                                            </div>
                                            {analysis.deliveryTips && analysis.deliveryTips.length > 0 && (
                                                <ul className="space-y-2">
                                                    {analysis.deliveryTips.map((tip, i) => (
                                                        <li key={i} className="text-sm text-blue-900/80 dark:text-blue-100/70 flex gap-2">
                                                            <div className="mt-1.5 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                                                            {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    {/* Evaluation Summary */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest">
                                            <CheckCircle2 size={14} />
                                            <span>Evaluation</span>
                                        </div>
                                        <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white leading-snug">
                                            {analysis.ack}
                                        </p>
                                    </div>

                                    {/* Focus Area */}
                                    {analysis.primaryFocus && (
                                        <div className="p-6 bg-blue-600/5 dark:bg-blue-400/5 rounded-3xl border border-blue-200/50 dark:border-blue-500/10 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                                                    <ChevronDown size={18} />
                                                </div>
                                                <h3 className="font-bold text-blue-900 dark:text-blue-100">
                                                    {analysis.primaryFocus.headline}
                                                </h3>
                                            </div>
                                            <p className="text-blue-900 dark:text-blue-100/70 text-sm leading-relaxed">
                                                {analysis.primaryFocus.body}
                                            </p>
                                        </div>
                                    )}

                                    {/* Observations */}
                                    {analysis.observations && (
                                        <div className="space-y-4">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Observations</div>
                                            <ul className="space-y-3">
                                                {analysis.observations.map((obs, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-slate-800 dark:text-slate-300">
                                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                                                        <span>{obs}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </section>
                            ) : null}
                        </div>

                        {/* Footer Actions */}
                        {!isThinking && (
                            <div className="p-6 md:p-8 bg-background dark:bg-white/5 border-t border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row gap-3">
                                <Button
                                    onClick={onRetry}
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-white dark:hover:bg-white/10 gap-2"
                                >
                                    <RotateCcw size={18} />
                                    Let me try again
                                </Button>

                                <Button
                                    onClick={onNext}
                                    className="flex-[1.5] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white font-bold gap-2"
                                >
                                    {isLastQuestion ? "Complete Session" : "Next Question"}
                                    <ArrowRight size={18} />
                                </Button>

                                {onStop && (
                                    <button
                                        onClick={onStop}
                                        className="md:hidden text-xs font-semibold text-slate-400 py-2"
                                    >
                                        Stop for now
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
