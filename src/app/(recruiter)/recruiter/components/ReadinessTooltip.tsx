"use client";

import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReadinessTooltipProps {
    narrative?: string;
    children: React.ReactNode;
}

export function ReadinessTooltip({ narrative, children }: ReadinessTooltipProps) {
    if (!narrative) return <>{children}</>;

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <div className="cursor-help inline-block">
                        {children}
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-slate-900 text-white border-white/10 p-4 rounded-xl shadow-2xl">
                    <h4 className="font-bold text-[10px] uppercase tracking-wider mb-2 text-blue-400">Readiness Narrative</h4>
                    <p className="text-xs leading-relaxed text-slate-300 italic">
                        &ldquo;{narrative}&rdquo;
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
