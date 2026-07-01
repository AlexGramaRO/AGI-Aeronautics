export type TextChunk = {
  content: string;
  index: number;
};

/**
 * Splits raw text into overlapping chunks suitable for embedding.
 * Character-based (not token-based) but sized conservatively so that
 * chunks stay well within embedding model context limits.
 */
export function chunkText(
  raw: string,
  options: { chunkSize?: number; overlap?: number } = {}
): TextChunk[] {
  const chunkSize = options.chunkSize ?? 1200;
  const overlap = options.overlap ?? 200;

  const normalized = raw.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (!normalized) return [];

  const paragraphs = normalized.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const chunks: TextChunk[] = [];
  let buffer = "";

  const pushBuffer = () => {
    const trimmed = buffer.trim();
    if (trimmed.length > 0) {
      chunks.push({ content: trimmed, index: chunks.length });
    }
    buffer = "";
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length > chunkSize) {
      // Paragraph itself is too long - split into fixed windows with overlap.
      if (buffer.length > 0) pushBuffer();
      let start = 0;
      while (start < paragraph.length) {
        const end = Math.min(start + chunkSize, paragraph.length);
        chunks.push({ content: paragraph.slice(start, end).trim(), index: chunks.length });
        if (end === paragraph.length) break;
        start = end - overlap;
      }
      continue;
    }

    if ((buffer + "\n\n" + paragraph).length > chunkSize) {
      pushBuffer();
      buffer = paragraph;
    } else {
      buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    }
  }

  pushBuffer();

  return chunks.filter((c) => c.content.length > 0);
}
