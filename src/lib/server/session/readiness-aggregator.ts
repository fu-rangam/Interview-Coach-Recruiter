/**
 * Logic for aggregating per-question readiness levels into a session-level readiness band.
 * Follows conservative "worst-case wins" principle: RL3 + RL1 = RL3.
 */

import { InterviewSession, AnalysisResult } from "@/lib/domain/types";

export type ReadinessLevel = 'RL1' | 'RL2' | 'RL3' | 'RL4';

const RL_ORDER: Record<ReadinessLevel, number> = {
    'RL4': 4, // Incomplete / Irrelevant
    'RL3': 3, // More Practice Recommended
    'RL2': 2, // Strong Potential
    'RL1': 1, // Ready
};

export class ReadinessAggregator {
    /**
     * Aggregates answers within a session to determine overall readiness.
     */
    static aggregateSession(session: InterviewSession): ReadinessLevel {
        const analyses = Object.values(session.answers)
            .map(a => a.analysis)
            .filter((a): a is AnalysisResult => !!a);

        if (analyses.length === 0) return 'RL4';

        // Check for technical "Incomplete" via status
        if (session.status !== 'COMPLETED') {
            // If they have answers but haven't "finished", it's still incomplete
            // unless we want to show partial progress. Use RL4 for now.
            return 'RL4';
        }

        // Aggregate by taking the "worst" (highest number) readiness found
        let highestRL: ReadinessLevel = 'RL1';
        let foundAny = false;

        for (const ana of analyses) {
            const rl = ana.readinessBand as ReadinessLevel | undefined;
            if (rl && RL_ORDER[rl]) {
                foundAny = true;
                if (RL_ORDER[rl] > RL_ORDER[highestRL]) {
                    highestRL = rl;
                }
            }
        }

        return foundAny ? highestRL : 'RL4';
    }

    /**
     * Maps RL identifier to human readable label for UI
     */
    static getLabel(rl?: ReadinessLevel): string {
        switch (rl) {
            case 'RL1': return 'Ready';
            case 'RL2': return 'Strong Potential';
            case 'RL3': return 'Practice Recommended';
            case 'RL4': return 'Incomplete';
            default: return 'Incomplete';
        }
    }

    /**
     * Generates a concise rule-based narrative based on the readiness level
     */
    static generateNarrative(rl?: ReadinessLevel): string {
        switch (rl) {
            case 'RL1':
                return "The candidate demonstrated high proficiency and readiness for the role across all evaluated questions.";
            case 'RL2':
                return "Strong performance with minor areas for refinement; the candidate shows solid potential.";
            case 'RL3':
                return "The candidate would benefit from additional practice in several key competency areas.";
            case 'RL4':
                return "The session is incomplete or the responses were too brief to establish a definitive readiness level.";
            default:
                return "No readiness assessment available yet.";
        }
    }
}
