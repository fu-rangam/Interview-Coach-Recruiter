
import { SessionProvider } from "@/context/SessionContext"
import SessionOrchestrator from "@/components/session/SessionOrchestrator"

export default function InterviewSessionPage({ params }: { params: { invite_token: string } }) {
  return (
    <SessionProvider>
      <SessionOrchestrator />
    </SessionProvider>
  )
}
