import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    Sparkles,
    Target,
    ListChecks,
    Layout,
    Binary,
    AlertTriangle,
    Briefcase,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { StrongResponseResult } from '@/lib/domain/types';

interface StrongResponseAccordionProps {
    data?: StrongResponseResult | null;
    isLoading: boolean;
    className?: string;
}

export function StrongResponseAccordion({ data, isLoading, className }: StrongResponseAccordionProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className={cn("w-full bg-white/5 rounded-xl border border-white/10 p-8", className)}>
                <div className="flex flex-col items-center justify-center space-y-3 text-white/50">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-200" />
                    <p className="text-sm font-medium">Generating a strong response...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { strongResponse, whyThisWorks } = data;

    const toggleSection = (id: string) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    return (
        <div className={cn("w-full space-y-4", className)}>
            {/* The Strong Response Card */}
            <div className="bg-transparent rounded-xl border border-white/10 p-6 shadow-sm">
                <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
                    {strongResponse}
                </p>
            </div>

            {/* Why This Works Accordion */}
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/60 px-2 uppercase tracking-wider">Why This Works</h4>

                <SectionHeader
                    id="lookingFor"
                    icon={Target}
                    title="What They're Looking For"
                    color="text-indigo-300"
                    isExpanded={expandedSection === 'lookingFor'}
                    onToggle={toggleSection}
                />
                <SectionContent isExpanded={expandedSection === 'lookingFor'}>
                    <p>{whyThisWorks.lookingFor}</p>
                </SectionContent>

                <SectionHeader
                    id="pointsToCover"
                    icon={ListChecks}
                    title="Points Covered"
                    color="text-emerald-300"
                    isExpanded={expandedSection === 'pointsToCover'}
                    onToggle={toggleSection}
                />
                <SectionContent isExpanded={expandedSection === 'pointsToCover'}>
                    <ul className="list-disc list-inside space-y-1">
                        {whyThisWorks.pointsToCover.map((point, i) => (
                            <li key={i}>{point}</li>
                        ))}
                    </ul>
                </SectionContent>

                <SectionHeader
                    id="answerFramework"
                    icon={Layout}
                    title="Framework Used"
                    color="text-blue-300"
                    isExpanded={expandedSection === 'answerFramework'}
                    onToggle={toggleSection}
                />
                <SectionContent isExpanded={expandedSection === 'answerFramework'}>
                    <p>{whyThisWorks.answerFramework}</p>
                </SectionContent>

                <SectionHeader
                    id="industrySpecifics"
                    icon={Binary}
                    title="Industry Specifics"
                    color="text-cyan-300"
                    isExpanded={expandedSection === 'industrySpecifics'}
                    onToggle={toggleSection}
                />
                <SectionContent isExpanded={expandedSection === 'industrySpecifics'}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/20 p-3 rounded-lg">
                            <span className="text-xs font-medium text-cyan-200/70 block mb-1">Metrics</span>
                            <p className="text-sm">{whyThisWorks.industrySpecifics.metrics}</p>
                        </div>
                        <div className="bg-black/20 p-3 rounded-lg">
                            <span className="text-xs font-medium text-cyan-200/70 block mb-1">Tools</span>
                            <p className="text-sm">{whyThisWorks.industrySpecifics.tools}</p>
                        </div>
                    </div>
                </SectionContent>

                <SectionHeader
                    id="mistakesToAvoid"
                    icon={AlertTriangle}
                    title="Mistakes Avoided"
                    color="text-rose-300"
                    isExpanded={expandedSection === 'mistakesToAvoid'}
                    onToggle={toggleSection}
                />
                <SectionContent isExpanded={expandedSection === 'mistakesToAvoid'}>
                    <ul className="list-disc list-inside space-y-1">
                        {whyThisWorks.mistakesToAvoid.map((mistake, i) => (
                            <li key={i}>{mistake}</li>
                        ))}
                    </ul>
                </SectionContent>

                <SectionHeader
                    id="proTip"
                    icon={Sparkles}
                    title="Pro Tip Application"
                    color="text-amber-300"
                    isExpanded={expandedSection === 'proTip'}
                    onToggle={toggleSection}
                />
                <SectionContent isExpanded={expandedSection === 'proTip'}>
                    <div className="flex gap-3">
                        <div className="shrink-0 mt-1">
                            <Briefcase className="w-4 h-4 text-amber-300" />
                        </div>
                        <p className="text-amber-50/90 italic">&quot;{whyThisWorks.proTip}&quot;</p>
                    </div>
                </SectionContent>
            </div>
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
