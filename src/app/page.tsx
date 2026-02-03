import { redirect } from 'next/navigation';

export default function Home() {
    // For V1 Demo convenience, redirect root to a demo session
    redirect('/s/demo-invite-token');
}
