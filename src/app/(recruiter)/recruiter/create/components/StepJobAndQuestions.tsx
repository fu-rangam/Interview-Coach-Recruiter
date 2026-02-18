"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { Details, QuestionInput, StepFooterProps } from "../constants";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface StepJobAndQuestionsProps {
    details: Details;
    setDetails: (details: Details) => void;
    star: QuestionInput[];
    setStar: (val: QuestionInput[]) => void;
    perma: QuestionInput[];
    setPerma: (val: QuestionInput[]) => void;
    technical: QuestionInput[];
    setTechnical: (val: QuestionInput[]) => void;
    onNext: () => void;
    onRandomizeJob?: () => void;
    onGenerateQuestionsAI?: () => void;
    isGeneratingQuestions?: boolean;
    StepFooter: React.ComponentType<StepFooterProps>;
}

export function StepJobAndQuestions({
    details, setDetails,
    star, setStar,
    perma, setPerma,
    technical, setTechnical,
    onNext,
    onRandomizeJob,
    onGenerateQuestionsAI,
    isGeneratingQuestions,
    StepFooter
}: StepJobAndQuestionsProps) {
    const isDev = process.env.NODE_ENV === 'development';

    const addTechnical = () => {
        setTechnical([...technical, {
            id: `tech-${Date.now()}`,
            text: '',
            category: 'Technical',
            label: `Technical Q${technical.length + 1}`
        }]);
    };

    const removeQuestion = (set: (val: QuestionInput[]) => void, list: QuestionInput[], id: string) => {
        set(list.filter(q => q.id !== id));
    };

    const updateQuestion = (set: (val: QuestionInput[]) => void, list: QuestionInput[], id: string, text: string) => {
        set(list.map(q => q.id === id ? { ...q, text } : q));
    };

    const hasAtLeastOneQuestion =
        star.some(q => q.text.trim()) ||
        perma.some(q => q.text.trim()) ||
        technical.some(q => q.text.trim());

    const isNextDisabled = !details.role || !details.reqId || !hasAtLeastOneQuestion;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold font-display">Step 1: Job Details & Questions</h2>
                        <p className="text-muted-foreground">Define the role and interview questions.</p>
                    </div>

                    {/* Dev Controls (Keep separate from Template Select) */}
                    {isDev && (
                        <div className="flex gap-2 items-center">
                            {onRandomizeJob && (
                                <button
                                    onClick={onRandomizeJob}
                                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors border border-amber-200"
                                >
                                    🎲 Random Job
                                </button>
                            )}
                            {onGenerateQuestionsAI && (
                                <button
                                    onClick={onGenerateQuestionsAI}
                                    disabled={isGeneratingQuestions}
                                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors border border-emerald-200 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {isGeneratingQuestions ? (
                                        <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                                    ) : (
                                        <>✨ AI Generate</>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Template Select - Now Stacked Below */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Apply Template:</span>
                    <div className="relative">
                        <select
                            className="h-9 min-w-[200px] rounded-md border text-xs px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            defaultValue=""
                        >
                            <option value="" disabled>Select a Template...</option>
                            <option value="temp1">Product Manager</option>
                            <option value="temp2">Software Engineer</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Job Details Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Req ID</label>
                            <input className="flex h-10 w-full rounded-md border bg-muted/50 px-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                                value={details.reqId} onChange={e => setDetails({ ...details, reqId: e.target.value })}
                                placeholder="e.g. RCI-ENG-101" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Target Role</label>
                            <input className="flex h-10 w-full rounded-md border bg-muted/50 px-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                                value={details.role} onChange={e => setDetails({ ...details, role: e.target.value })}
                                placeholder="e.g. Senior Product Manager" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Job Description <span className="text-muted-foreground font-normal">(Optional)</span></label>
                        <textarea className="flex min-h-[100px] w-full rounded-md border bg-muted/50 px-3 py-2 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                            value={details.jd} onChange={e => setDetails({ ...details, jd: e.target.value })}
                            placeholder="Paste the job description here..." />
                    </div>

                </CardContent>
            </Card>

            {/* Questions Section */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Interview Questions</h3>

                {/* STAR Section */}
                <Card>
                    <CardHeader><CardTitle>STAR Questions (Behavioral)</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {star.map((q, idx) => (
                            <div key={q.id}>
                                <input className="flex h-10 w-full rounded-md border bg-muted/50 px-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                                    value={q.text} onChange={e => updateQuestion(setStar, star, q.id, e.target.value)}
                                    placeholder={`STAR Question ${idx + 1}...`} />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* PERMA Section */}
                <Card>
                    <CardHeader><CardTitle>PERMA Questions (Culture/Fit)</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {perma.map(q => (
                            <div key={q.id}>
                                <input className="flex h-10 w-full rounded-md border bg-muted/50 px-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                                    value={q.text} onChange={e => updateQuestion(setPerma, perma, q.id, e.target.value)}
                                    placeholder={`${q.label} Question...`} />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Technical Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Technical Questions</CardTitle>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={addTechnical}
                            className="hidden sm:flex text-emerald-600 border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {technical.map((q, idx) => (
                            <div key={q.id} className="flex gap-2 items-center">
                                <div className="flex-1">
                                    <input className="flex h-10 w-full rounded-md border bg-muted/50 px-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                                        value={q.text} onChange={e => updateQuestion(setTechnical, technical, q.id, e.target.value)}
                                        placeholder={`Technical Question ${idx + 1}...`} />
                                </div>
                                {technical.length > 1 && (
                                    <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => removeQuestion(setTechnical, technical, q.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            onClick={addTechnical}
                            className="w-full sm:hidden border-dashed text-emerald-600 border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 mt-2"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Technical Question
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <StepFooter
                onNext={onNext}
                nextLabel={<>Next: Add Candidates <ChevronRight className="ml-2 w-4 h-4" /></>}
                isNextDisabled={isNextDisabled}
                customAction={
                    <Link href="/recruiter/templates" className="w-full sm:w-auto block">
                        <Button variant="outline" className="text-slate-600 w-full h-12 sm:h-10">
                            <Save className="w-4 h-4 mr-2" />
                            Save as Template
                        </Button>
                    </Link>
                }
            />
        </div>
    );
}
