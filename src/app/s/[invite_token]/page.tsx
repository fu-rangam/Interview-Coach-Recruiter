import InterviewSessionPage from "@/pages/InterviewSessionPage"

// Next.js App Router Entry Point
// Adapts the route params to the Page Orchestrator

export default function Page({ params }: { params: { invite_token: string } }) {
    return <InterviewSessionPage params={params} />
}
