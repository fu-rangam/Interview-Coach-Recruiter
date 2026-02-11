import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    Target,
    ListChecks,
    Layout,
    Binary,
    AlertTriangle,
    Loader2,
    Sparkles,
    Briefcase
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { QuestionTips } from '@/lib/domain/types';

interface TipsAccordionProps {
    tips?: QuestionTips | null;
    isLoading: boolean;
    className?: string;
}

export function TipsAccordion({ tips, isLoading, className }: TipsAccordionProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('lookingFor');

    if (isLoading) {
        return (
            <div className={cn("w-full bg-white/5 rounded-xl border border-white/10 p-8", className)}>
                <div className="flex flex-col items-center justify-center space-y-3 text-white/50">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-200" />
                    <p className="text-sm font-medium">Analyzing question context...</p>
                </div>
            </div>
        );
    }

    if (!tips) return null;

    const toggleSection = (id: string) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    return (
        <div className={cn("w-full space-y-2", className)}>
            <SectionHeader
                id="lookingFor"
                icon={Target}
                title="What They're Looking For"
                color="text-indigo-300"
                isExpanded={expandedSection === 'lookingFor'}
                onToggle={toggleSection}
            />
            <SectionContent isExpanded={expandedSection === 'lookingFor'}>
                <p>{tips.lookingFor}</p>
            </SectionContent>

            <SectionHeader
                id="pointsToCover"
                icon={ListChecks}
                title="Key Points to Cover"
                color="text-emerald-300"
                isExpanded={expandedSection === 'pointsToCover'}
                onToggle={toggleSection}
            />
            <SectionContent isExpanded={expandedSection === 'pointsToCover'}>
                <ul className="list-disc list-inside space-y-1">
                    {tips.pointsToCover.map((point, i) => (
                        <li key={i}>{point}</li>
                    ))}
                </ul>
            </SectionContent>

            <SectionHeader
                id="framework"
                icon={Layout}
                title="Suggested Framework"
                color="text-blue-300"
                isExpanded={expandedSection === 'framework'}
                onToggle={toggleSection}
            />
            <SectionContent isExpanded={expandedSection === 'framework'}>
                <p>{tips.answerFramework}</p>
            </SectionContent>

            <SectionHeader
                id="industry"
                icon={Binary}
                title="Industry Specifics"
                color="text-cyan-300"
                isExpanded={expandedSection === 'industry'}
                onToggle={toggleSection}
            />
            <SectionContent isExpanded={expandedSection === 'industry'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/20 p-3 rounded-lg">
                        <span className="text-xs font-medium text-cyan-200/70 block mb-1">Metrics</span>
                        <p className="text-sm">{tips.industrySpecifics.metrics}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg">
                        <span className="text-xs font-medium text-cyan-200/70 block mb-1">Tools</span>
                        <p className="text-sm">{tips.industrySpecifics.tools}</p>
                    </div>
                </div>
            </SectionContent>

            <SectionHeader
                id="mistakes"
                icon={AlertTriangle}
                title="Mistakes to Avoid"
                color="text-rose-300"
                isExpanded={expandedSection === 'mistakes'}
                onToggle={toggleSection}
            />
            <SectionContent isExpanded={expandedSection === 'mistakes'}>
                <ul className="list-disc list-inside space-y-1">
                    {tips.mistakesToAvoid.map((mistake, i) => (
                        <li key={i}>{mistake}</li>
                    ))}
                </ul>
            </SectionContent>

            <SectionHeader
                id="protip"
                icon={Sparkles}
                title="Pro Tip"
                color="text-amber-300"
                isExpanded={expandedSection === 'protip'}
                onToggle={toggleSection}
            />
            <SectionContent isExpanded={expandedSection === 'protip'}>
                <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                        <Briefcase className="w-4 h-4 text-amber-300" />
                    </div>
                    <p className="text-amber-50/90 italic">&quot;{tips.proTip}&quot;</p>
                </div>
            </SectionContent>
        </div>
    );
}

// --- Subcomponents ---

interface SectionHeaderProps {
    id: string;
    icon: React.ElementType;
    title: string;
    color: string;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

function SectionHeader({
    id,
    icon: Icon,
    title,
    color,
    isExpanded,
    onToggle
}: SectionHeaderProps) {
    return (
        <button
            onClick={() => onToggle(id)}
            className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group text-left",
                isExpanded
                    ? "bg-white/10 border-white/20"
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-black/20 transition-colors", color)}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={cn("font-medium transition-colors text-white")}>
                    {title}
                </span>
            </div>
            <ChevronDown
                className={cn(
                    "w-5 h-5 text-white/50 transition-transform duration-300",
                    isExpanded && "rotate-180 text-white"
                )}
            />
        </button>
    );
}

function SectionContent({ isExpanded, children }: { isExpanded: boolean; children: React.ReactNode }) {
    return (
        <AnimatePresence initial={false}>
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <div className="p-4 pt-0 text-white/90 text-sm leading-relaxed">
                        <div className="p-4 bg-black/20 rounded-b-xl border-x border-b border-white/10 -mt-1 mx-1">
                            {children}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
