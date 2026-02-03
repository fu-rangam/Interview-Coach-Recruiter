import { Button } from "@/components/ui/button"
import { MonitorPlay, Clock, ShieldCheck } from "lucide-react"

interface LandingScreenProps {
    onStart: () => void;
    role?: string;
}

export default function LandingScreen({ onStart, role = "Candidate" }: LandingScreenProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
            <div className="bg-card shadow-lg border rounded-xl p-8 max-w-lg w-full text-center space-y-8">

                {/* Header */}
                <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <MonitorPlay className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {role} Interview Practice
                    </h1>
                    <p className="text-muted-foreground">
                        Let's get you ready for your next big opportunity.
                    </p>
                </div>

                {/* Key Points */}
                <div className="grid gap-4 text-left">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <Clock className="w-5 h-5 text-primary mt-0.5" />
                        <div className="space-y-1">
                            <h3 className="font-medium">No Time Limit</h3>
                            <p className="text-sm text-muted-foreground">
                                Take your time to think. This is a safe space to practice, not a test.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                        <div className="space-y-1">
                            <h3 className="font-medium">Private Feedback</h3>
                            <p className="text-sm text-muted-foreground">
                                Your answers are analyzed by AI to give you instant, private coaching tips.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="pt-4">
                    <Button size="lg" className="w-full text-lg h-12" onClick={onStart}>
                        Start Practice Session
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                        By starting, you agree to our practice terms.
                    </p>
                </div>
            </div>
        </div>
    )
}
