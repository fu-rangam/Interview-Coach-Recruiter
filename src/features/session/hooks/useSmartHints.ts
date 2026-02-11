import { useState, useEffect, useCallback } from 'react';
import { Question, Blueprint, QuestionTips } from '@/lib/domain/types';
import { Logger } from '@/lib/logger';

// Caching Key Prefix
const CACHE_KEY_PREFIX = 'smart_hints_';

export interface SmartHintsState {
    hints: QuestionTips | null;
    isLoading: boolean;
    error: string | null;
}

export function useSmartHints(
    question: Question,
    role: string,
    blueprint?: Blueprint
) {
    const [state, setState] = useState<SmartHintsState>({
        hints: null,
        isLoading: false,
        error: null
    });

    const cacheKey = `${CACHE_KEY_PREFIX}${question.id}`;

    // Load from cache on mount or question change
    useEffect(() => {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setState({ hints: parsed, isLoading: false, error: null });
            } catch (e) {
                console.error("Failed to parse cached hints", e);
                sessionStorage.removeItem(cacheKey);
            }
        } else {
            // Reset if no cache (don't auto-fetch unless requested? 
            // Actually, we usually want to fetch ONLY when the user asks for a hint 
            // to save tokens. The Hook should expose a `fetchHints` function.)
            setState({ hints: null, isLoading: false, error: null });
        }
    }, [question.id, cacheKey]);

    const fetchHints = useCallback(async () => {
        // If already cached, don't fetch.
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            setState(prev => ({ ...prev, hints: JSON.parse(cached) }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await fetch('/api/tips/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question.text,
                    role: role,
                    competency: question.competencyId ? { name: question.competencyId } : undefined, // simplified
                    blueprint: blueprint
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch hints');
            }

            const data = await response.json();

            // Cache it
            sessionStorage.setItem(cacheKey, JSON.stringify(data));

            setState({ hints: data, isLoading: false, error: null });

        } catch (err) {
            Logger.error("Error fetching hints", err);
            setState({ hints: null, isLoading: false, error: (err as Error).message });
        }
    }, [question, role, blueprint, cacheKey]);

    return {
        ...state,
        fetchHints
    };
}
