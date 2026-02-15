export interface Details {
    role: string;
    jd: string;
    firstName: string;
    lastName: string;
    candidateEmail: string;
    reqId: string;
}

export interface QuestionInput {
    id: string; // temp id for UI key
    text: string;
    category: string;
    label: string; // Display label (e.g. "Situation")
    isLocked?: boolean; // If structural (STAR/PERMA)
}

export const STAR_TEMPLATE: QuestionInput[] = [
    { id: 's', text: '', category: 'STAR', label: 'Situation', isLocked: true },
    { id: 't', text: '', category: 'STAR', label: 'Task', isLocked: true },
    { id: 'a', text: '', category: 'STAR', label: 'Action', isLocked: true },
    { id: 'r', text: '', category: 'STAR', label: 'Result', isLocked: true },
];

export const PERMA_TEMPLATE: QuestionInput[] = [
    { id: 'p', text: '', category: 'PERMA', label: 'Positive Emotion', isLocked: true },
    { id: 'e', text: '', category: 'PERMA', label: 'Engagement', isLocked: true },
    { id: 'rel', text: '', category: 'PERMA', label: 'Relationships', isLocked: true },
    { id: 'm', text: '', category: 'PERMA', label: 'Meaning', isLocked: true },
    { id: 'acc', text: '', category: 'PERMA', label: 'Accomplishment', isLocked: true },
];

export interface StepFooterProps {
    onBack?: () => void;
    onNext: () => void;
    nextLabel: string | React.ReactNode;
    isNextDisabled?: boolean;
}

// ─── Dev-Only Data Pools ────────────────────────────────────────
export const DEV_CANDIDATE_POOL = [
    { firstName: "Ian", lastName: "Caldwell", email: "icclearly@yopmail.com" },
    { firstName: "Maria", lastName: "Santos", email: "msantos@yopmail.com" },
    { firstName: "Jamal", lastName: "Williams", email: "jwilliams@yopmail.com" },
    { firstName: "Priya", lastName: "Patel", email: "ppatel@yopmail.com" },
    { firstName: "Chen", lastName: "Wei", email: "cwei@yopmail.com" },
    { firstName: "Aisha", lastName: "Mohammed", email: "amohammed@yopmail.com" },
    { firstName: "Tyler", lastName: "Robinson", email: "trobinson@yopmail.com" },
    { firstName: "Sofia", lastName: "Hernandez", email: "shernandez@yopmail.com" },
];

export const DEV_JOB_POOL = [
    {
        reqId: "RCI-QD-18250-1",
        role: "Phlebotomist II",
        jd: "Responsible for performing venipuncture and capillary blood draws on patients of all ages. Must maintain accuracy in specimen labeling, follow infection control protocols, and demonstrate strong patient communication skills. 1+ years clinical phlebotomy experience required."
    },
    {
        reqId: "RCI-IT-29410-3",
        role: "Help Desk Technician I",
        jd: "Provide first-line technical support via phone, email, and ticketing system. Troubleshoot hardware, software, and network issues. Document solutions in knowledge base. CompTIA A+ preferred. Strong customer service orientation required."
    },
    {
        reqId: "RCI-FN-33105-2",
        role: "Accounts Payable Specialist",
        jd: "Process vendor invoices, reconcile statements, and manage payment schedules. Experience with ERP systems (SAP or Oracle preferred). Strong attention to detail, 2+ years AP experience. Associate's degree in Accounting or related field."
    },
    {
        reqId: "RCI-HR-41220-1",
        role: "Recruitment Coordinator",
        jd: "Support full-cycle recruiting by scheduling interviews, managing ATS data, coordinating onboarding logistics, and maintaining candidate communications. Strong organizational skills, proficiency in Workday or similar ATS. Bachelor's degree preferred."
    },
    {
        reqId: "RCI-MK-55780-4",
        role: "Social Media Marketing Associate",
        jd: "Create and schedule content across Instagram, LinkedIn, and TikTok. Monitor engagement metrics, assist with campaign planning, and collaborate with design team. 1-2 years social media experience, familiarity with Hootsuite or Sprout Social."
    },
];
