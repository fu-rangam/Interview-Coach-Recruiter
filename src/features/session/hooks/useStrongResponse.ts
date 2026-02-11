import { useState, useEffect, useCallback } from 'react';
import { QuestionTips, StrongResponseResult } from '@/lib/domain/types';
import { Logger } from '@/lib/logger';

// Caching Key Prefix
const CACHE_KEY_PREFIX = 'strong_response_';

export interface StrongResponseState {
    data: StrongResponseResult | null;
    isLoading: boolean;
    error: string | null;
}

export function useStrongResponse(
    questionId: string,
    questionText: string,
    tips: QuestionTips | null
) {
    const [state, setState] = useState<StrongResponseState>({
        data: null,
        isLoading: false,
        error: null,
    });

    const fetchStrongResponse = useCallback(async () => {
        if (!questionId || !questionText || !tips) return;

        // Check Cache
        const cacheKey = `${CACHE_KEY_PREFIX}${questionId}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setState({ data: parsed, isLoading: false, error: null });
                return;
            } catch (e) {
                Logger.warn('Failed to parse cached strong response', e);
                sessionStorage.removeItem(cacheKey);
            }
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await fetch('/api/response/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: questionText, tips }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch strong response');
            }

            const data: StrongResponseResult = await response.json();

            // Update Cache
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (e) {
                Logger.warn('Failed to cache strong response', e);
            }

            setState({ data, isLoading: false, error: null });

        } catch (err: unknown) {
            Logger.error('Error fetching strong response:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setState({
                data: null,
                isLoading: false,
                error: errorMessage,
            });
        }
    }, [questionId, questionText, tips]);

    // Auto-load when tips become available
    useEffect(() => {
        // Only fetch if we have tips, no data yet, and not loading
        if (tips && !state.data && !state.isLoading && !state.error) {
            fetchStrongResponse();
        }
    }, [tips, state.data, state.isLoading, state.error, fetchStrongResponse]);

    // Reset when question changes
    useEffect(() => {
        setState({ data: null, isLoading: false, error: null });
    }, [questionId]);

    return {
        ...state,
        fetchStrongResponse, // Exposed in case manual retry is needed
    };
}
