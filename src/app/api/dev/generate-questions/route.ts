"use server";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Logger } from "@/lib/logger";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

import { showDemoTools } from "@/lib/feature-flags";

export async function POST(req: NextRequest) {
    // Demo-mode gate (replaces hardcoded dev gate)
    if (!showDemoTools()) {
        return NextResponse.json({ error: "Not available" }, { status: 404 });
    }

    try {
        const { role, jobDescription, resume } = await req.json();

        if (!role) {
            return NextResponse.json({ error: "Role is required" }, { status: 400 });
        }

        if (!ai) {
            Logger.warn("[Dev] No API key, returning mock questions");
            return NextResponse.json(getMockQuestions(role));
        }

        // --- Inclusive Logic Detection ---
        const roleLower = role.toLowerCase();
        const isEntryLevelOrBlueCollar =
            roleLower.includes('warehouse') ||
            roleLower.includes('associate') ||
            roleLower.includes('clerk') ||
            roleLower.includes('helper') ||
            roleLower.includes('worker') ||
            roleLower.includes('driver') ||
            roleLower.includes('aide') ||
            roleLower.includes('healthcare') ||
            roleLower.includes('service') ||
            roleLower.includes('food') ||
            roleLower.includes('hospitality') ||
            roleLower.includes('entry') ||
            roleLower.includes('junior') ||
            roleLower.includes('apprentice');

        const isSeniorOrCorporate =
            roleLower.includes('senior') ||
            roleLower.includes('lead') ||
            roleLower.includes('manager') ||
            roleLower.includes('director') ||
            roleLower.includes('vp') ||
            roleLower.includes('head') ||
            roleLower.includes('architect') ||
            roleLower.includes('principal');

        const prompt = `
SYSTEM:
You are a Lead Recruiter designing high-fidelity interview questions for a "${role}" position.
Your goal is to create a realistic, inclusive, and role-appropriate interview set.

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n` : ''}
${resume ? `CANDIDATE RESUME:\n${resume}\n` : ''}

PHASE 1: SIGNAL ANALYSIS (Internal Reasoning)
1. Extract 3-4 core "Unspoken" requirements from the JD (e.g., physical stamina for warehouse, empathy for healthcare, or strategic influence for leaders).
2. If a RESUME is provided, identify 2-3 specific background markers to anchor questions (e.g., previous experience in a similar industry).

PHASE 2: COGNITIVE CALIBRATION
${isEntryLevelOrBlueCollar ? `
- ROLE TYPE: Entry-Level / Blue-Collar / Service.
- READABILITY: STRICT 5th-Grade readability. Use plain phrasing, common terms, and short sentences.
- FOCUS: Reliability, Teamwork, Safety, and Patient/Customer Care.
- BEHAVIORAL STYLE: Use "Concrete Situational Scenarios" (e.g., "What would you do if...") instead of abstract "Tell me about a time..." questions.
` : isSeniorOrCorporate ? `
- ROLE TYPE: Senior / Corporate / Leadership.
- READABILITY: Professional, concise, and strategic.
- FOCUS: Rationale, Influence, Result-drive, and Strategic Trade-offs.
- BEHAVIORAL STYLE: Focus on complexity, choice, and long-term impact.
` : `
- ROLE TYPE: Standard Professional.
- READABILITY: Clear, professional 8th-grade level.
- FOCUS: Competency mastery and role fit.
`}

PHASE 3: QUESTION GENERATION
Generate interview questions in these categories:

1. Behavioral Questions - Generate exactly 4 questions.
   - If Entry-Level/Blue-Collar: Focus on situational reliability and teamwork.
   - If Senior: Focus on leadership, change management, and influence.
   - Dimension Labels to use: Situation, Task, Action, Result (to map to the internal STAR schema).

2. Culture/Fit Questions - Generate exactly 5 questions based on PERMA dimensions:
   - Dimensions: Positive Emotion, Engagement, Relationships, Meaning, Accomplishment.
   - Anchor these to the specific company environment implied in the JD.

3. Technical/Hard Skill Questions - Generate 1-2 questions.
   - Anchor these to the actual tools or tasks mentioned in the JD.
   - If a Resume is provided, tie the technical question to their stated tools/experience.

OUTPUT FORMAT (strict JSON, no other text):
{
  "star": [
    { "text": "question text", "label": "Situation" },
    { "text": "question text", "label": "Task" },
    { "text": "question text", "label": "Action" },
    { "text": "question text", "label": "Result" }
  ],
  "perma": [
    { "text": "question text", "label": "Positive Emotion" },
    { "text": "question text", "label": "Engagement" },
    { "text": "question text", "label": "Relationships" },
    { "text": "question text", "label": "Meaning" },
    { "text": "question text", "label": "Accomplishment" }
  ],
  "technical": [
    { "text": "question text" }
  ]
}

RULES:
- Questions must be relevant to the specific role and candidates.
- Use plain, supportive language for entry-level roles.
- Do not mention the word "STAR" or "PERMA" in the question text.
- Output ONLY valid JSON.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: 'application/json' },
        });

        const text = response.text;
        if (!text) throw new Error("Empty AI response");

        const result = JSON.parse(text);
        return NextResponse.json(result);

    } catch (error) {
        Logger.error("[Dev] Question generation failed", error);
        return NextResponse.json(
            { error: "Failed to generate questions" },
            { status: 500 }
        );
    }
}

function getMockQuestions(role: string) {
    return {
        star: [
            { text: `Describe a challenging situation you encountered as a ${role}.`, label: "Situation" },
            { text: `What were your key responsibilities in that situation?`, label: "Task" },
            { text: `What specific actions did you take to address it?`, label: "Action" },
            { text: `What was the outcome of your actions?`, label: "Result" },
        ],
        perma: [
            { text: `How do you maintain enthusiasm in your role as a ${role}?`, label: "Positive Emotion" },
            { text: `What aspects of the ${role} position keep you most engaged?`, label: "Engagement" },
            { text: `How do you build effective working relationships with your team?`, label: "Relationships" },
            { text: `What does your work as a ${role} mean to you?`, label: "Meaning" },
            { text: `What professional accomplishment are you most proud of?`, label: "Accomplishment" },
        ],
        technical: [
            { text: `What tools or techniques do you use most frequently as a ${role}?` },
        ],
    };
}
