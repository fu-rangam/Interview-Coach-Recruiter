"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Copy } from "lucide-react";
import { RecruiterProfile, InviteResult } from "../constants";


interface StepBatchSendProps {
    results: InviteResult[];
    role: string;
    recruiterProfile: RecruiterProfile;
    onBack: () => void;
    resetWizard: () => void;
}

export function StepBatchSend({
    results,
    role,
    recruiterProfile,
    onBack,
    resetWizard
}: StepBatchSendProps) {

    const subject = `Interview Invitation: ${role}`;
    const getBody = (firstName: string, link: string) =>
        `Hi ${firstName},

I'd like to invite you to a preliminary interview practice session for the ${role} role. This interactive session will help us understand your experience better.

Please click the button below to start whenever you're ready:
${link}

Best regards,
${recruiterProfile.name}`;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold font-display text-emerald-600">Invites Generated!</h2>
                <p className="text-muted-foreground">Send the invites to your candidates using the dashboard below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                {/* Column 1: Generic Email Preview */}
                <Card className="h-full flex flex-col overflow-hidden border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50 border-b py-3">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Email Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-6 font-sans text-sm leading-relaxed text-slate-700">
                        <div className="mb-4 pb-4 border-b border-slate-100">
                            <div className="grid grid-cols-[60px_1fr] gap-2 mb-2">
                                <span className="text-slate-400 font-medium">Subject:</span>
                                <span className="font-semibold text-slate-900">{subject}</span>
                            </div>
                        </div>
                        <div className="whitespace-pre-wrap">
                            {getBody("[Candidate Name]", "https://ready2work.ai/s/example-token")}
                        </div>
                    </CardContent>
                </Card>

                {/* Column 2: Action List */}
                <Card className="h-full flex flex-col overflow-hidden border-slate-200 shadow-sm bg-slate-50/50">
                    <CardHeader className="bg-white border-b py-3">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Candidate Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                        {results.map((result, idx) => {
                            const mailtoLink = `mailto:${result.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(getBody(result.firstName, result.link))}`;

                            return (
                                <Card key={idx} className="bg-white hover:shadow-md transition-shadow border-slate-200 group">
                                    <div className="p-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-slate-900">{result.firstName} {result.lastName}</div>
                                            <div className="text-xs text-slate-500">{result.email}</div>
                                        </div>
                                        <a href={mailtoLink} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-none transition-all active:scale-95">
                                                <Mail className="w-3 h-3" />
                                                Send Invite
                                            </Button>
                                        </a>
                                    </div>
                                    <div className="px-4 pb-3 pt-0 flex items-center gap-2">
                                        <div className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded border flex-1 truncate">
                                            {result.link}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-slate-400 hover:text-slate-600"
                                            onClick={() => navigator.clipboard.writeText(result.link)}
                                            title="Copy Link"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" onClick={onBack}>
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back
                </Button>
                <Button onClick={resetWizard} variant="outline" className="text-slate-600">
                    Start New Batch
                </Button>
            </div>
        </div>
    );
}
