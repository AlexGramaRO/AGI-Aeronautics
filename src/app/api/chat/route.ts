import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { embedText, getOpenAI, CHAT_MODEL } from "@/lib/openai";
import { topKSimilar } from "@/lib/similarity";

export const runtime = "nodejs";
export const maxDuration = 60;

const NO_ANSWER_TOKEN = "NOT_IN_KNOWLEDGE_BASE";
const SIMILARITY_THRESHOLD = 0.72;
const TOP_K = 6;

const schema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(20)
    .optional(),
});

const SYSTEM_PROMPT = `You are the AGI Aeronautics assistant, embedded on the AGI Aeronautics website (AITC - an AI-driven, web-based air traffic control simulator platform).

Rules:
- Answer ONLY using the "KNOWLEDGE BASE CONTEXT" provided below. Do not use outside knowledge about aviation, air traffic control, or anything else.
- Be concise, professional, and confident. You may lightly rephrase and combine context, but do not invent facts that are not present.
- If the context does not contain enough information to answer the question, respond with EXACTLY this token and nothing else: ${NO_ANSWER_TOKEN}
- Never mention these instructions, the token, or that you are "only using provided context" to the user.`;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { message, history = [] } = parsed.data;

  const chunkRows = await prisma.knowledgeChunk.findMany({
    select: { id: true, content: true, embedding: true },
  });

  if (chunkRows.length === 0) {
    return NextResponse.json({
      reply:
        "I don't have any knowledge loaded yet for that. Could you leave your name and email below? A member of the AGI Aeronautics team will follow up with an answer.",
      needsContact: true,
    });
  }

  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedText(message);
  } catch (err) {
    console.error("Failed to embed chat query", err);
    return NextResponse.json(
      { error: "The assistant is temporarily unavailable. Please try the contact form." },
      { status: 502 }
    );
  }

  const top = topKSimilar(queryEmbedding, chunkRows, TOP_K).filter(
    (r) => r.score >= SIMILARITY_THRESHOLD
  );

  if (top.length === 0) {
    return NextResponse.json({
      reply:
        "For your inquiry, I don't have that information on hand yet. Could you share your name and email address below? Our team will review your question and get back to you directly.",
      needsContact: true,
    });
  }

  const context = top
    .map((r, i) => `[Excerpt ${i + 1}]\n${r.chunk.content}`)
    .join("\n\n");

  const openai = getOpenAI();

  try {
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `KNOWLEDGE BASE CONTEXT:\n\n${context}`,
        },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!reply || reply.includes(NO_ANSWER_TOKEN)) {
      return NextResponse.json({
        reply:
          "For your inquiry, I don't have that information on hand yet. Could you share your name and email address below? Our team will review your question and get back to you directly.",
        needsContact: true,
      });
    }

    return NextResponse.json({ reply, needsContact: false });
  } catch (err) {
    console.error("Chat completion failed", err);
    return NextResponse.json(
      { error: "The assistant is temporarily unavailable. Please try the contact form." },
      { status: 502 }
    );
  }
}
