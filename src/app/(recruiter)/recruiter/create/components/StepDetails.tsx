"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Details, StepFooterProps } from "../constants";
import { ChevronRight } from "lucide-react";
import { showDemoTools } from "@/lib/feature-flags";

interface StepDetailsProps {
    details: Details;
    setDetails: (details: Details) => void;
    onNext: () => void;
    onRandomizeCandidate?: () => void;
    onRandomizeJob?: () => void;
    StepFooter: React.ComponentType<StepFooterProps>;
}

export function StepDetails({ details, setDetails, onNext, onRandomizeCandidate, onRandomizeJob, StepFooter }: StepDetailsProps) {
    const isDemo = showDemoTools();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold font-display">Step 1: Role & Candidate</h2>
                <p className="text-muted-foreground">Enter the details for this interview session.</p>
            </div>

            {/* Demo Tools (formerly Dev Only) */}
            {isDemo && (
                <div className="flex gap-2">
                    {onRandomizeCandidate && (
                        <button
                            onClick={onRandomizeCandidate}
                            className="px-3 py-1.5 text-xs font-medium rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors border border-violet-200"
                        >
                            🎲 Random Candidate
                        </button>
                    )}
                    {onRandomizeJob && (
                        <button
                            onClick={onRandomizeJob}
                            className="px-3 py-1.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors border border-amber-200"
                        >
                            🎲 Random Job
                        </button>
                    )}
                </div>
            )}

            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <input className="flex h-10 w-full rounded-md border bg-muted/50 px-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                                value={details.firstName} onChange={e => setDetails({ ...details, firstName: e.target.value })}
                                placeholder="First Name" />
                        </div>
                        <div className="space-y-2">
                            <input className="flex h-10 w-full rounded-md border bg-muted/50 px-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                                value={details.lastName} onChange={e => setDetails({ ...details, lastName: e.target.value })}
                                placeholder="Last Name" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <input className="flex h-10 w-full rounded-md border bg-muted/50 px-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400" type="email"
                                value={details.candidateEmail} onChange={e => setDetails({ ...details, candidateEmail: e.target.value })}
                                placeholder="Candidate Email" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <input className="flex h-10 w-full rounded-md border bg-muted/50 px-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                                value={details.reqId} onChange={e => setDetails({ ...details, reqId: e.target.value })}
                                placeholder="Req ID" />
                        </div>
                        <div className="space-y-2">
                            <input className="flex h-10 w-full rounded-md border bg-muted/50 px-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                                value={details.role} onChange={e => setDetails({ ...details, role: e.target.value })}
                                placeholder="Target Role" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <textarea className="flex min-h-[100px] w-full rounded-md border bg-muted/50 px-3 py-2 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                            value={details.jd} onChange={e => setDetails({ ...details, jd: e.target.value })}
                            placeholder="Job Description (Optional)" />
                    </div>
                </CardContent>
            </Card>

            <StepFooter
                onNext={onNext}
                nextLabel={<>Next: Questions <ChevronRight className="ml-2 w-4 h-4" /></>}
                isNextDisabled={!details.role || !details.firstName || !details.lastName || !details.candidateEmail || !details.reqId}
            />
        </div>
    );
}

