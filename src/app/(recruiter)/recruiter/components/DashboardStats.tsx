"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Zap, Clock } from "lucide-react";
import { SessionDashboardMetrics } from "@/lib/domain/types";

interface DashboardStatsProps {
    metrics: SessionDashboardMetrics;
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
    const stats = [
        {
            label: "Total Invites",
            value: metrics.totalInvites,
            icon: Target,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "In Progress",
            value: metrics.activeSessions,
            icon: Zap,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            label: "Completed",
            value: metrics.completedSessions,
            icon: Sparkles,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            label: "Avg. Engagement",
            value: `${Math.round(metrics.averageEngagementTimeSeconds / 60)}m`,
            icon: Clock,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-none shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
