import { useMemo } from "react";
import { selectNow } from "@/lib/state/selectors";
import { useSessionQuery } from "./useSessionQuery";
import { useSessionMutations } from "./useSessionMutations";

export function useDomainSession(initialSessionId?: string, candidateToken?: string) {
    const { session, setSession, refresh } = useSessionQuery(initialSessionId, candidateToken);
    const mutations = useSessionMutations(session, setSession, candidateToken);

    // Derived state for the UI
    const now = useMemo(() => selectNow(session), [session]);

    return {
        session,
        now,
        actions: {
            ...mutations,
            refresh
        }
    };
}
