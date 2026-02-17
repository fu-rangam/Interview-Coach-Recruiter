"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Details, QuestionInput, StepFooterProps } from "../constants";
import { CandidateRow } from "./StepCandidates";
import { Check, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepPreviewCombinedProps {
    details: Details;
    setDetailStep?: () => void;
    star: QuestionInput[];
    perma: QuestionInput[];
    technical: QuestionInput[];
    candidates: CandidateRow[];
    setCandidateStep?: () => void;
    onBack: () => void;
    onHandleCreate: () => void;
    isLoading: boolean;
    error: string | null;
    StepFooter: React.ComponentType<StepFooterProps>;
}

export function StepPreviewCombined({
    details, setDetailStep,
    star, perma, technical,
    candidates, setCandidateStep,
    onBack, onHandleCreate,
    isLoading, error,
    StepFooter
}: StepPreviewCombinedProps) {

    const activeStar = star.filter(q => q.text.trim());
    const activePerma = perma.filter(q => q.text.trim());
    const activeTechnical = technical.filter(q => q.text.trim());
    const totalQuestions = activeStar.length + activePerma.length + activeTechnical.length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold font-display">Step 3: Preview & Confirm</h2>
                <p className="text-muted-foreground">Review the details before generating the invites.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Job & Questions Summary */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Job Details</Badge>
                            <span className="font-semibold text-slate-700">{details.role}</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-500 font-mono text-xs">{details.reqId}</span>
                        </div>
                        {setDetailStep && (
                            <Button variant="ghost" size="sm" onClick={setDetailStep} className="h-8 text-slate-500">
                                <Edit className="w-3 h-3 mr-1" /> Edit
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-slate-50 p-3 rounded border">
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Behavioral</span>
                                <span className="text-lg font-semibold text-slate-700">{activeStar.length}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border">
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Culture</span>
                                <span className="text-lg font-semibold text-slate-700">{activePerma.length}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border">
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Technical</span>
                                <span className="text-lg font-semibold text-slate-700">{activeTechnical.length}</span>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500">
                            Total {totalQuestions} questions configured.
                        </div>
                    </CardContent>
                </Card>

                {/* Candidates Summary */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-4 border-b bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Candidates</Badge>
                            <span className="font-semibold text-slate-700">{candidates.length} Recipients</span>
                        </div>
                        {setCandidateStep && (
                            <Button variant="ghost" size="sm" onClick={setCandidateStep} className="h-8 text-slate-500">
                                <Edit className="w-3 h-3 mr-1" /> Edit
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                            {candidates.map((c, i) => (
                                <div key={c.id} className="flex items-center justify-between text-sm p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-slate-300 text-xs w-4">{(i + 1).toString().padStart(2, '0')}</span>
                                        <div className="font-medium text-slate-700">{c.firstName} {c.lastName}</div>
                                    </div>
                                    <div className="text-slate-500">{c.email}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    Error: {error}
                </div>
            )}

            <StepFooter
                onBack={onBack}
                onNext={onHandleCreate}
                nextLabel={isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Check className="w-4 h-4 mr-2" /> Generate Invites</>}
                isNextDisabled={isLoading}
            />
        </div>
    );
}
