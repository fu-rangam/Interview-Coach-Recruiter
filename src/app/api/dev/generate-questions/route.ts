"use server";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Logger } from "@/lib/logger";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(req: NextRequest) {
    // Dev-only gate
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: "Not available" }, { status: 404 });
    }

    try {
        const { role, jobDescription } = await req.json();

        if (!role) {
            return NextResponse.json({ error: "Role is required" }, { status: 400 });
        }

        if (!ai) {
            Logger.warn("[Dev] No API key, returning mock questions");
            return NextResponse.json(getMockQuestions(role));
        }

        const prompt = `You are an expert HR interviewer designing interview questions for a "${role}" position.
${jobDescription ? `Job Description: ${jobDescription}` : ''}

Generate interview questions in these categories:

1. STAR Questions (Behavioral) - Generate exactly 4 questions, one for each STAR dimension:
   - Situation: A question that asks the candidate to describe a relevant work situation
   - Task: A question about responsibilities and tasks they handled
   - Action: A question about specific actions they took
   - Result: A question about outcomes and results they achieved

2. PERMA Questions (Culture/Fit) - Generate exactly 5 questions, one for each PERMA dimension:
   - Positive Emotion: About maintaining positivity at work
   - Engagement: About staying motivated and engaged
   - Relationships: About building workplace relationships
   - Meaning: About finding purpose in their work
   - Accomplishment: About achievements and growth

3. Technical Questions - Generate 1-2 questions specific to the role's technical requirements.

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
- Questions must be relevant to the specific role.
- Questions should be open-ended and encourage storytelling.
- Use clear, professional language appropriate for the role level.
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
