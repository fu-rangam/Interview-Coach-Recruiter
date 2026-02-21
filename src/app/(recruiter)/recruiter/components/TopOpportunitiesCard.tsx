"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, Info } from "lucide-react";
import { SessionDashboardMetrics } from "@/lib/domain/types";
import { Badge } from "@/components/ui/badge";

interface TopOpportunitiesCardProps {
    metrics: SessionDashboardMetrics;
}

export function TopOpportunitiesCard({ metrics }: TopOpportunitiesCardProps) {
    const { commonObservations, completedSessions } = metrics;

    if (completedSessions === 0 || commonObservations.length === 0) {
        return null;
    }

    return (
        <Card className="border-none shadow-sm bg-white h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                        <Lightbulb size={18} />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold">Candidate Struggles</CardTitle>
                        <CardDescription>Recurring factual markers from responses</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <ul className="space-y-4">
                    {commonObservations.map((obs, i) => (
                        <li key={i} className="flex gap-4 group">
                            <div className="flex-shrink-0 mt-1 flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                    {obs.count}
                                </div>
                                {i < commonObservations.length - 1 && <div className="w-px h-full bg-slate-100 mt-2" />}
                            </div>
                            <div className="space-y-1 pb-4">
                                <p className="text-sm text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
                                    {obs.text}
                                </p>
                                {obs.count > 1 && (
                                    <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none font-normal text-[10px] px-1.5 py-0 uppercase tracking-tighter">
                                        Seen in {Math.round((obs.count / completedSessions) * 100)}% of sessions
                                    </Badge>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="mt-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex gap-3">
                    <div className="text-emerald-600 shrink-0">
                        <Info size={16} />
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed italic">
                        Tip: Large cohorts often struggle with specific STAR components. Use these markers to guide your candidate pre-screen questions.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
