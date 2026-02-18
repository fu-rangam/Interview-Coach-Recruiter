import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getRecruiterSessions } from "./actions";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient, getCachedUser } from "@/lib/supabase/server";
import { RecruiterSessionsTable } from "./components/RecruiterSessionsTable";
import { ReadinessLegend } from "./components/ReadinessLegend";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function RecruiterDashboard() {
    const user = await getCachedUser();
    if (!user) redirect("/login");

    const [sessions, profileData] = await Promise.all([
        getRecruiterSessions(),
        createClient().from('recruiter_profiles').select('timezone').eq('recruiter_id', user.id).single()
    ]);

    const recruiterTimezone = profileData.data?.timezone;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">Invites & Sessions</h1>
                    <p className="text-slate-500 mt-1">Manage your interview invites and review candidate results.</p>
                </div>
                <Button asChild className="shadow-md">
                    <Link href="/recruiter/create">
                        <Plus className="w-4 h-4 mr-2" />
                        New Invite
                    </Link>
                </Button>
            </div>

            <ReadinessLegend />

            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl font-bold font-display">Recent Activity</CardTitle>
                    <CardDescription>A list of all interview sessions created by you.</CardDescription>
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
