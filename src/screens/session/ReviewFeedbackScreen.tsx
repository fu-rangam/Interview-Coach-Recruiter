import { Button } from "@/components/ui/button"
import { Question, AnalysisResult } from "@/lib/domain/types"
import { ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"

interface ReviewFeedbackScreenProps {
    question: Question;
    analysis?: AnalysisResult;
    onNext: () => void;
}

export default function ReviewFeedbackScreen({ question, analysis, onNext }: ReviewFeedbackScreenProps) {
    if (!analysis) {
        // Fallback or Error state if analysis is missing in REVIEWING state
        return <div className="p-8 text-center">Loading feedback...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="px-6 py-4 bg-white border-b sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <h1 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Feedback Review
                    </h1>
                    <Button onClick={onNext} className="gap-2">
                        Next Question <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-6 space-y-8">

                {/* Context Card */}
                <section className="bg-white rounded-xl p-6 border shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-2">
                        The Question
                    </div>
                    <h2 className="text-xl font-medium text-foreground">
                        {question.text}
                    </h2>
                </section>

                {/* Coach Reaction */}
                {analysis.coachReaction && (
                    <section className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-white p-2 rounded-full border shadow-sm">
                                <span className="text-xl">🤖</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-blue-900">Coach's Take</h3>
                                <p className="text-blue-800/80 leading-relaxed">
                                    {analysis.coachReaction}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Key Feedback Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Strengths */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="w-5 h-5" />
                            Highlights
                        </h3>
                        <ul className="space-y-3">
                            {analysis.feedback?.slice(0, 3).map((point, i) => (
                                <li key={i} className="bg-white p-4 rounded-lg border text-sm leading-relaxed shadow-sm">
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Improvements (Delivery Tips or Missing Elements) */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2 text-amber-700">
                            <AlertCircle className="w-5 h-5" />
                            Opportunities
                        </h3>
                        <ul className="space-y-3">
                            {(analysis.deliveryTips || analysis.missingElements || []).slice(0, 3).map((point, i) => (
                                <li key={i} className="bg-white p-4 rounded-lg border text-sm leading-relaxed shadow-sm">
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Score / Dimension (Optional for V1) */}
                {analysis.rating && (
                    <div className="text-center pt-8 border-t">
                        <span className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
                            Rating: {analysis.rating}
                        </span>
                    </div>
                )}
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden">
                <Button onClick={onNext} size="lg" className="w-full">
                    Next Question
                </Button>
            </div>
        </div>
    )
}
