import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { ORGANIZATIONS, publishedContacts } from "../prisma/data/organizations";

const KIND: Record<string, string> = {
  ANSP: "Air navigation service",
  TRAINING_ACADEMY: "Training academy",
  UNIVERSITY: "University",
  OTHER: "Other",
};

function ascii(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\n\x20-\x7e]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

function wrap(text: string, width: number) {
  const lines: string[] = [];
  for (const raw of text.split("\n")) {
    let rest = raw.trim();
    if (!rest) {
      lines.push("");
      continue;
    }
    while (rest.length > width) {
      let cut = rest.lastIndexOf(" ", width);
      if (cut < 24) cut = width;
      lines.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    lines.push(rest);
  }
  return lines;
}

function paginate(paragraphs: string[]) {
  const pages: string[][] = [];
  let page: string[] = [];
  const limit = 48;
  const flush = () => {
    if (page.length) pages.push(page);
    page = [];
  };
  for (const paragraph of paragraphs) {
    const lines = wrap(paragraph, 92);
    if (page.length && page.length + lines.length + 1 > limit) flush();
    for (const line of lines) {
      if (page.length >= limit) flush();
      page.push(line);
    }
    if (page.length >= limit) flush();
    else page.push("");
  }
  flush();
  return pages;
}

function escapePdf(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdf(pages: string[][]) {
  const objects: string[] = [];
  const font = 3;
  const pagesId = 2;
  let next = 4;
  const contentIds: number[] = [];
  const pageIds: number[] = [];

  for (const lines of pages) {
    const contentId = next++;
    const pageId = next++;
    contentIds.push(contentId);
    pageIds.push(pageId);
    const commands = ["BT", "/F1 10 Tf", "13 TL", "46 760 Td"];
    lines.forEach((line, index) => {
      if (index) commands.push("T*");
      commands.push(`(${escapePdf(line)}) Tj`);
    });
    commands.push("ET");
    const stream = commands.join("\n");
    objects[contentId] = `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`;
    objects[pageId] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${font} 0 R >> >> >>`;
  }

  objects[1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[2] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let output = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = Buffer.byteLength(output, "utf8");
    output += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(output, "utf8");
  output += `xref\n0 ${objects.length}\n`;
  output += "0000000000 65535 f \n";
  for (let id = 1; id < objects.length; id += 1) {
    output += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(output, "utf8");
}

function directoryParagraphs() {
  const intro = [
    "SECTION: AiTC outreach directory",
    "This document is the AGI Aeronautics outreach directory for AiTC. Each record is one organisation. A record lists the kind of organisation, country, city, published email addresses, website, published ATM system, and published simulator notes.",
    "SECTION: How to read a directory record",
    "A field that says Not published was not found in a public source. This directory does not record whether an email has been sent or whether a reply arrived. Sent and received messages stay with the organisation on the outreach map. Named personal mailboxes and unpublished contract prices are omitted.",
  ];
  const records = [...ORGANIZATIONS]
    .sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name))
    .map((org) => {
      const emails = publishedContacts(org);
      const emailText = emails.length
        ? emails.map((contact) => `${contact.email} (${contact.title})`).join("; ")
        : "No published email";
      const simulator = [org.simulatorKind, org.simulatorVendor, org.simulatorAcquired].filter(Boolean).join("; ");
      return [
        `ORGANISATION: ${org.name}`,
        `KIND: ${KIND[org.kind] || org.kind}`,
        `COUNTRY: ${org.country}`,
        `CITY: ${org.city}`,
        `EMAIL: ${emailText}`,
        `WEBSITE: ${org.website || "Not published"}`,
        `ATM SYSTEM: ${org.atmSystem || "Not published"}`,
        `SIMULATOR: ${simulator || "Not published"}`,
        `NOTES: ${org.notes || "Not published"}`,
      ].join("\n");
    });
  return [...intro, ...records].map((paragraph) => ascii(paragraph));
}

const STRATEGY = readFileSync("scripts/aitc-sales-guide.txt", "utf8")
  .split(/\n\s*\n/)
  .map((section) => section.trim())
  .filter(Boolean);

function chunkFriendly(paragraphs: string[]) {
  const ready: string[] = [];
  for (const paragraph of paragraphs) {
    let rest = paragraph.trim();
    const prefix = rest.split("\n")[0]?.replace(/ continued$/, "") || "SECTION: AiTC";
    while (rest.length > 1000) {
      let cut = rest.lastIndexOf("\n", 1000);
      if (cut < 240) cut = rest.lastIndexOf(" ", 1000);
      if (cut < 240) cut = 1000;
      ready.push(rest.slice(0, cut).trim());
      rest = `${prefix} continued\n${rest.slice(cut).trim()}`;
    }
    if (rest) ready.push(rest);
  }
  return ready;
}

mkdirSync("public/knowledge", { recursive: true });
writeFileSync("public/knowledge/aitc-outreach-directory.pdf", buildPdf(paginate(chunkFriendly(directoryParagraphs()))));
writeFileSync(
  "public/knowledge/aitc-outreach-strategy.pdf",
  buildPdf(paginate(chunkFriendly(STRATEGY.map((paragraph) => ascii(paragraph)))))
);
const long = STRATEGY.filter((section) => section.length > 1000);
console.log(`Directory organisations: ${ORGANIZATIONS.length}`);
console.log(`Strategy sections: ${STRATEGY.length}, characters: ${STRATEGY.join("\n\n").length}, over 1000: ${long.length}`);
if (long.length) {
  console.log(long.map((section) => `${section.length} ${section.slice(0, 80)}`).join("\n"));
}
