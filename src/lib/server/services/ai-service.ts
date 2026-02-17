import { GoogleGenAI } from "@google/genai";
import { Question, Blueprint, AnalysisResult, InterviewSession, Answer } from "@/lib/domain/types";
import { buildAnalysisContext } from "@/lib/ai/prompts";
import { Logger } from "@/lib/logger";

const apiKey = process.env.GEMINI_API_KEY;
Logger.info("[AIService] API Key Check", { present: !!apiKey, length: apiKey?.length });
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export class AIService {
    static async analyzeAnswer(
        question: Question,
        answerText: string | null,
        audioData: { base64: string; mimeType: string } | null,
        blueprint?: Blueprint,
        intakeData?: Record<string, unknown>,
        retryContext?: { trigger: 'user' | 'coach'; focus?: string }
    ): Promise<AnalysisResult> {

        // 1. Context Construction
        const contextPrompt = buildAnalysisContext(question, blueprint, intakeData, retryContext);

        // 2. Strict JSON System Prompt (V2 Schema)
        const systemPrompt = `SYSTEM:
You are a calm, supportive interview coach.
You must produce feedback that is coaching, not evaluation.

NON-NEGOTIABLE RULES:
- Output MUST be valid JSON only. No prose outside JSON.
- Never use scores, numbers, rankings, or comparisons to other people.
- Never say pass/fail, readiness, competitive, hire, reject, or imply screening in the text.
- Never simulate an interviewer’s judgment.
- Keep language clear and plain-spoken (match READING LEVEL intent).
- Use “listener” phrasing rather than “interviewer” phrasing.

STRUCTURE RULES:
- ack: EXACTLY 1 sentence. MUST be positive/validating. Focus on a specific strength or good attempt.
- primaryFocus: EXACTLY ONE focus. It must be a communication lever the user can act on next.
- whyThisMatters: include ONLY if tier >= 1 AND providedAllowed=true.
- nextAction: A short, punchy button label (Verb + Noun) for immediate practice. E.g., "Practice structured answers", "Try again with STAR".
- readinessLevel: Determine RL1, RL2, RL3, or RL4 based on the definitions below.
- deliveryStatus: (Voice only) A brief status (e.g., 'Clear & Paced', 'Slightly Fast', 'Hesitant').
- deliveryTips: (Voice only) 1-2 actionable tips for better delivery.

READINESS LEVEL DEFINITIONS (Internal Logic):
- RL1 (Ready): Clear, relevant examples; coherent communication; minor refinements only.
- RL2 (Strong Potential): Good preparation but inconsistent depth; minor confusion/hesitancy; examples present but underdeveloped.
- RL3 (Practice Recommended): Vague/incomplete answers; difficulty articulating; limited role alignment.
- RL4 (Incomplete): Answer is too short to judge or irrelevant.

EVIDENCE LOGIC (Internal):
- Use the "observations" field (internal use only) to list 1-3 specific facts that justify the Readiness Level.
- Do NOT use advice verbs in observations. Just facts relative to the RL definition.

SAFETY:
If the input evidence is weak or unclear, use more tentative language and keep feedback minimal.
If you are uncertain, prefer silence (empty observations) over invented specifics.`;

        const schemaPrompt = `
Generate post-answer feedback as strict JSON matching this schema:
{
  "ack": "string",
  "primaryFocus": {
    "dimension": "structural_clarity | outcome_explicitness | specificity_concreteness | decision_rationale | focus_relevance | delivery_control",
    "headline": "string",
    "body": "string"
  },
  "whyThisMatters": "string (optional)",
  "observations": ["string", "string", "string"],
  "nextAction": {
    "label": "string",
    "actionType": "redo_answer | next_question | practice_example | stop_for_now"
  },
  "meta": {
    "tier": 0|1|2,
    "modality": "text|voice",
    "signalQuality": "insufficient|emerging|reliable|strong",
    "confidence": "low|medium|high",
    "readinessLevel": "RL1|RL2|RL3|RL4"
  },
  "deliveryStatus": "string (optional, e.g. 'Clear & Paced', 'Slightly Fast')",
  "deliveryTips": ["string", "string"],
  "transcript": "string (REQUIRED for voice input, optional for text)"
}

CONTEXT (do not reveal these labels; use them only to shape delivery):
- surface: recruiter_prep
- modality: ${audioData ? 'voice' : 'text'}
- tier: 1
- signalQuality: reliable
- userConfidence: medium
- providedAllowedForWhy: true

QUESTION:
${question.text}

OBSERVABLE MARKERS (facts; do not embellish):
- (Heuristics disabled for audio/mixed input, rely on extensive blueprint context)

FOCUS CONSTRAINT:
- Choose the most relevant dimension based on the context and answer.

OUTPUT REQUIREMENTS:
- Output ONLY valid JSON.
`;

        // Mock Fallback
        if (!ai) {
            Logger.warn("AI Service: No API Key, returning mock analysis V2.");
            await new Promise(r => setTimeout(r, 1500));
            return {
                ack: "I see you're focusing on a specific project challenge.",
                primaryFocus: {
                    dimension: "structural_clarity",
                    headline: "Let's organize the story",
                    body: "You jumped straight into the solution. Start by setting the context so I understand the stakes."
                },
                whyThisMatters: "Without context, the impact of your actions is hard to judge.",
                observations: ["Started with 'I decided to...'", "Mentioned '20% increase' at the end"],
                nextAction: {
                    label: "Try again with STAR",
                    actionType: "redo_answer"
                },
                deliveryStatus: "Clear & Paced",
                deliveryTips: [
                    "Great volume control throughout the response.",
                    "Try to reduce filler words like 'um' in the introduction."
                ],
                meta: {
                    tier: 1,
                    modality: audioData ? "voice" : "text",
                    signalQuality: "emerging",
                    confidence: "medium"
                },
                transcript: answerText || "Audio Answer (Mock)"
            };
        }

        try {
            const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
                { text: systemPrompt },
                { text: contextPrompt }, // Injected Blueprint/Intake Context
                { text: schemaPrompt }
            ];

            if (audioData) {
                parts.push({
                    inlineData: {
                        mimeType: audioData.mimeType,
                        data: audioData.base64
                    }
                });
                parts.push({ text: "Please transcribe the audio and analyze it. Return the transcript in the 'transcript' field." });
            } else if (answerText) {
                parts.push({ text: `USER ANSWER: "${answerText}"` });
            } else {
                throw new Error("No input provided (text or audio)");
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: parts
                },
                config: {
                    responseMimeType: 'application/json',
                },
            });

            const text = response.text;
            if (!text) throw new Error("Empty AI Response");

            const result = JSON.parse(text);

            // Ensure transcript exists (from AI or input)
            const finalTranscript = result.transcript || answerText || "Audio Answer";

            const mappedResult = {
                ...result,
                transcript: finalTranscript,
                deliveryStatus: result.deliveryStatus,
                deliveryTips: result.deliveryTips,
                // Map to legacy if UI still needs it, but prefer meta.readinessLevel
                readinessBand: result.meta?.readinessLevel || result.readinessLevel || "RL4",
                coachReaction: result.ack,
                strengths: result.observations || [], // Internal evidence for RL
                opportunities: [result.primaryFocus?.headline || "Review feedback"]
            };

            return mappedResult;

        } catch (error) {
            Logger.error("AI Analysis Failed", error);
            // Fallback V2
            return {
                ack: "I noted your answer.",
                primaryFocus: {
                    dimension: "structural_clarity",
                    headline: "System Offline",
                    body: "I couldn't analyze that response right now. Please try again."
                },
                observations: [],
                nextAction: { label: "Move On", actionType: "next_question" },
                transcript: answerText || "Audio Answer",
                readinessBand: "RL2",
                coachReaction: "Error",
                strengths: [],
                opportunities: []
            };
        }
    }

    static async summarizeSession(
        session: InterviewSession
    ): Promise<string> {
        if (!ai) return "Session completed. No automated summary available.";

        const answersContext = Object.values(session.answers as Record<string, Answer> || {})
            .map((a: Answer, i: number) => {
                const qText = session.questions.find((q: Question) => q.id === a.questionId)?.text || "Unknown Question";
                return `Q${i + 1}: ${qText}\nA: ${a.transcript}\nResult: ${a.analysis?.readinessBand || 'RL4'}`;
            })
            .join("\n\n");

        const prompt = `
SYSTEM:
You are an expert recruiter assistant.
Summarize the following interview session into a concise, professional 1-2 sentence executive summary for a recruiter.
Focus on the candidate's core strengths and primary readiness level.
Do not use pass/fail language.
Be specific about the role: ${session.role}.

ANSWERS:
${answersContext}

ROLE CONTEXT:
${session.jobDescription}

Generate ONLY the summary string (no JSON, no intro).
`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [{ text: prompt }]
                },
                config: {
                    // Standard prompt, no JSON schema needed here
                }
            });

            return response.text || "No summary generated.";
        } catch (error) {
            Logger.error("Session Summarization Failed", error);
            // Fallback for UI
            return `The candidate completed the interview for the ${session.role} position. They demonstrated consistent effort across all questions.`;
        }
    }
}
