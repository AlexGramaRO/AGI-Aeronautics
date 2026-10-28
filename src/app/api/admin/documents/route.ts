import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";
import { extractText } from "@/lib/parseDocument";
import { chunkText } from "@/lib/chunking";
import { embedTexts } from "@/lib/openai";
import { packEmbedding } from "@/lib/embedding";

export const runtime = "nodejs";
export const maxDuration = 120;

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return null;
  }
  return user;
}

export async function GET() {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      charCount: true,
      chunkCount: true,
      createdAt: true,
      uploadedBy: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ documents });
}

export async function POST(request: NextRequest) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let text: string;
  try {
    text = await extractText(buffer, file.type, file.name);
  } catch (err) {
    console.error("Failed to parse document", err);
    return NextResponse.json(
      { error: "Could not read that file. Try a .txt, .md, .pdf or .docx file." },
      { status: 422 }
    );
  }

  const chunks = chunkText(text);

  if (chunks.length === 0) {
    return NextResponse.json(
      { error: "No readable text was found in that document." },
      { status: 422 }
    );
  }

  let embeddings: number[][];
  try {
    embeddings = await embedTexts(chunks.map((c) => c.content));
  } catch (err) {
    console.error("Embedding generation failed", err);
    return NextResponse.json(
      { error: "Failed to generate embeddings. Check the OpenAI API key configuration." },
      { status: 502 }
    );
  }

  const document = await prisma.document.create({
    data: {
      filename: file.name,
      mimeType: file.type || "text/plain",
      charCount: text.length,
      chunkCount: chunks.length,
      uploadedById: admin.sub,
      chunks: {
        create: chunks.map((chunk, i) => ({
          chunkIndex: chunk.index,
          content: chunk.content,
          embedding: packEmbedding(embeddings[i]) as never,
        })),
      },
    },
    select: {
      id: true,
      filename: true,
      chunkCount: true,
      charCount: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ document });
}
