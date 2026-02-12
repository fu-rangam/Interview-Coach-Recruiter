"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryTooltipProps {
    category: string;
    children: React.ReactNode;
}

const CATEGORY_DEFINITIONS: Record<string, { title: string, description: string }> = {
    STAR: {
        title: "Behavioral (STAR)",
        description: "Focuses on past experiences. Situation, Task, Action, Result."
    },
    PERMA: {
        title: "Culture (PERMA)",
        description: "Mindset and well-being. Positive Emotion, Engagement, Relationships, Meaning, Accomplishment."
    },
    TECHNICAL: {
        title: "Technical",
        description: "Assessments of role-specific skills and domain expertise."
    },
    OTHER: {
        title: "General",
        description: "General interview questions and conversation starters."
    }
};

export function CategoryTooltip({ category, children }: CategoryTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const upperCategory = category.toUpperCase();
    const info = CATEGORY_DEFINITIONS[upperCategory] || CATEGORY_DEFINITIONS.OTHER;

    // Handlers for Desktop Hover
    const onMouseEnter = () => {
        // Only trigger on mouse-capable devices
        if (window.matchMedia('(hover: hover)').matches) {
            setIsVisible(true);
        }
    };
    const onMouseLeave = () => {
        if (window.matchMedia('(hover: hover)').matches) {
            setIsVisible(false);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        // Toggle behavior for mobile/touch or explicit click
        e.stopPropagation();
        setIsVisible(!isVisible);
    };

    // Close on click anywhere else
    useEffect(() => {
        if (!isVisible) return;
        const close = () => setIsVisible(false);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [isVisible]);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            aria-expanded={isVisible}
        >
            {children}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute left-0 top-full mt-3 z-50 w-64 p-4 bg-slate-900 text-white rounded-xl shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside tooltip
                    >
                        <h4 className="font-bold text-sm mb-1 text-blue-400">{info.title}</h4>
                        <p className="text-xs leading-relaxed text-slate-300">
                            {info.description}
                        </p>

                        {/* Tooltip Arrow - Top */}
                        <div className="absolute bottom-full left-6 -mb-px border-8 border-transparent border-b-slate-900" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
