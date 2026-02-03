import { Loader2, Sparkles } from "lucide-react"

export default function PendingEvaluationScreen() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">

                {/* Visual Anchor */}
                <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-50"></div>
                    <div className="relative bg-white border-2 border-primary/20 rounded-full w-full h-full flex items-center justify-center shadow-lg">
                        <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Analyzing Your Answer</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Our AI coach is reviewing your response against the competency framework...
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-primary/80 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                </div>
            </div>
        </div>
    )
}
