import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Question } from "@/lib/domain/types"
import { MessageSquareText, Send } from "lucide-react"

interface ActiveQuestionScreenProps {
    question: Question;
    currentQuestionIndex: number;
    totalQuestions: number;
    onSubmit: (answer: string) => void;
}

export default function ActiveQuestionScreen({
    question,
    currentQuestionIndex,
    totalQuestions,
    onSubmit
}: ActiveQuestionScreenProps) {
    const [answer, setAnswer] = useState("")

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            {/* Header / Progress */}
            <header className="px-6 py-4 border-b bg-white flex justify-between items-center">
                <div className="text-sm font-medium text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                </div>
                <div className="flex items-center gap-2 text-primary font-medium">
                    <MessageSquareText className="w-4 h-4" />
                    <span>Interview in Progress</span>
                </div>
            </header>

            <main className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col gap-6">

                {/* Question Card */}
                <div className="bg-white rounded-xl shadow-sm border p-8 space-y-4">
                    <div className="text-xs uppercase tracking-wide font-semibold text-primary/80">
                        {question.category}
                    </div>
                    <h2 className="text-2xl font-bold leading-tight text-foreground">
                        {question.text}
                    </h2>
                </div>

                {/* Answer Area */}
                <div className="flex-1 flex flex-col gap-2">
                    <label className="sr-only" htmlFor="answer-input">Your Answer</label>
                    <textarea
                        id="answer-input"
                        className="flex-1 w-full rounded-xl border p-6 text-lg/relaxed focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none shadow-sm"
                        placeholder="Type your answer here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-muted-foreground pl-2">
                            {answer.length > 0 ? "Saved" : "Start typing..."}
                        </span>
                        <Button
                            size="lg"
                            onClick={() => onSubmit(answer)}
                            disabled={!answer.trim()}
                            className="px-8"
                        >
                            Submit Answer <Send className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>

            </main>
        </div>
    )
}
