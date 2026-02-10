"use client";

import { SessionProvider } from "../context/SessionContext"
import SessionOrchestrator from "./SessionOrchestrator"

interface InterviewSessionScreenProps {
  sessionId?: string;
  candidateToken?: string;
  initialConfig?: {
    role: string;
    jobDescription?: string;
  }
}

export default function InterviewSessionScreen({ sessionId, candidateToken, initialConfig }: InterviewSessionScreenProps) {
  // We must provide the session context specifically for this invite/session
  return (
    <SessionProvider sessionId={sessionId} candidateToken={candidateToken} initialConfig={initialConfig}>
      <SessionOrchestrator />
    </SessionProvider>
  )
}
