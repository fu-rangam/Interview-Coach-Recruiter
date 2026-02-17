"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TemplatesPage() {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-6">
                <Link href="/recruiter/create">
                    <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Create Invite
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2 font-display">Interview Templates</h1>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Manage your reusable job descriptions and question sets here. This feature is coming soon.
                </p>
                <Button disabled>Create New Template</Button>
            </div>
        </div>
    );
}
