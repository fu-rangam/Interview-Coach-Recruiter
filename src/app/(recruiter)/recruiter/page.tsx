import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getRecruiterSessions, getRecruiterMetrics } from "./actions";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient, getCachedUser } from "@/lib/supabase/server";
import { RecruiterSessionsTable } from "./components/RecruiterSessionsTable";
import { ReadinessLegend } from "./components/ReadinessLegend";
import { DashboardStats } from "./components/DashboardStats";
import { CurrentBaselineBlock } from "./components/CurrentBaselineBlock";
import { CoachingFocusCard } from "./components/CoachingFocusCard";
import { TopOpportunitiesCard } from "./components/TopOpportunitiesCard";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function RecruiterDashboard() {
    const user = await getCachedUser();
    if (!user) redirect("/login");

    const [sessions, metrics, profileData] = await Promise.all([
        getRecruiterSessions(),
        getRecruiterMetrics(),
        createClient().from('recruiter_profiles').select('timezone').eq('recruiter_id', user.id).single()
    ]);

    const recruiterTimezone = profileData.data?.timezone;

    return (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">Dashboard</h1>
                    <p className="text-slate-500 mt-1">At-a-glance view of your hiring pipeline and coaching impact.</p>
                </div>
                <Button asChild className="shadow-md">
                    <Link href="/recruiter/create">
                        <Plus className="w-4 h-4 mr-2" />
                        New Invite
                    </Link>
                </Button>
            </div>

            {/* Top Baseline Header */}
            <CurrentBaselineBlock metrics={metrics} />

            {/* High Level Stats */}
            <DashboardStats metrics={metrics} />

            {/* Discovery Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CoachingFocusCard metrics={metrics} />
                <TopOpportunitiesCard metrics={metrics} />
            </div>

            <Card className="border-none shadow-none bg-transparent pt-4">
                <CardHeader className="px-0 pt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold font-display">Manage Invites</CardTitle>
                            <CardDescription>Track individual candidate progress and readiness scores.</CardDescription>
                        </div>
                        <ReadinessLegend />
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <RecruiterSessionsTable
                        initialSessions={sessions}
                        recruiterTimezone={recruiterTimezone}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
