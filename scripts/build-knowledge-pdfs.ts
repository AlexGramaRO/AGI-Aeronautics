import { mkdirSync, writeFileSync } from "node:fs";
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

const STRATEGY = [
  "SECTION: AiTC contact strategy. What this document is. This is the AGI Aeronautics marketing and first-contact strategy for AiTC. It describes the product, how to write the first email, how to follow up when there is no reply, how to follow up when there is a reply, how to ask for a trial, and how the licence is structured. AGI Aeronautics confirms any price in a written proposal. This document does not set a public price.",
  "SECTION: AiTC product. Browser radar and tower. AiTC runs both radar simulations and tower simulations directly in the browser. A training session can start on the hardware that is already in the room. The same exercise can be opened from another location without installing a separate simulator application for that operating system.",
  "SECTION: AiTC product. Hardware and operating system. AiTC is hardware-agnostic. It does not depend on one operating system. An academy, a university, or an air navigation service can run an exercise on the computers it already has, because the simulation is delivered in the browser.",
  "SECTION: AiTC product. Airspace creation. Airspace is created inside AiTC. It can be drawn manually, or it can be created with the artificial intelligence in the platform. The source can be a file from another simulator, an aeronautical information publication, or another file that contains the airspace information. An entire country airspace can be created within minutes.",
  "SECTION: AiTC product. Exercise creation and preview. Exercises are created inside AiTC. The exercise-creation module can preview the exercise before it is used in training. The person creating the exercise can test it and plan the exact traffic picture they want.",
  "SECTION: AiTC product. Exercise assistant. During exercise creation, an artificial intelligence assistant accepts voice commands and text commands. A creator can ask for a number of aircraft on a specific route, or for particular aircraft types. The creator can then adjust by hand where the conflicts occur and where the traffic peak is.",
  "SECTION: AiTC product. Traffic load. For an exercise, AiTC can show the traffic that flows through each sector in that exercise. The creator can see the volume of traffic, or the traffic load, in those sectors.",
  "SECTION: AiTC product. Aircraft scripts. Inside the exercise-creation module, scripts can make aircraft carry out actions by themselves. The aircraft follow the script automatically.",
  "SECTION: AiTC product. AI piloting. AiTC can also use scripts for artificial intelligence piloting. The aircraft can be piloted by the artificial intelligence, so a human pseudo-pilot is not required at the other end of the exercise.",
  "SECTION: AiTC product. Replay. Training sessions can be recorded and played back in the replay module. The playback is not a video recording and it is not an audio recording. It is a scripted recording that reproduces the exercise from the start. Because a script recording is a hundred times smaller, and more, than a video recording, a large number of exercises can be stored.",
  "SECTION: AiTC product. Voice and video. Voice communication runs in the browser. Users who are connected to the same session can use simulated ground-to-air lines and ground-to-ground lines. The voice system also supports video calling. In remote training, the instructor can see the trainee during the session.",
  "SECTION: AiTC product. Flight envelope. The aircraft database uses a detailed flight envelope for each aircraft. Aircraft speed and altitude are not taken from a simple value table. The aircraft in the simulation follows that flight-envelope model. A student can open the flight-envelope graphic inside the simulation and see the limitations of the aircraft.",
  "SECTION: AiTC first contact. Who receives the email. Write to the published institutional mailbox for that organisation. Use the email stored on the outreach map. Do not write to a named personal mailbox when the directory gives an office, enquiry, or training mailbox. One organisation receives one first email.",
  "SECTION: AiTC first contact. Subject and opening. The subject names AiTC and the organisation. The first paragraph says that the sender is AGI Aeronautics and that AiTC is a browser air traffic control simulator for radar and tower training. Do not claim that a meeting is already arranged. Do not claim that the organisation has already agreed to anything.",
  "SECTION: AiTC first contact. One relevant capability. The second paragraph names one capability that matches the recipient. For an academy or university, that can be exercise creation, preview, and artificial intelligence piloting so a human pseudo-pilot is not required. For an air navigation service, that can be creating their airspace from their own files, including an aeronautical information publication, within minutes. Keep the email short.",
  "SECTION: AiTC first contact. The ask. Close by asking for a short conversation about a trial. Offer to show radar and tower in the browser, on hardware they already use. Sign the message as AGI Aeronautics. The mailbox signature is added when the message is sent from the outbox.",
  "SECTION: AiTC follow-up when there is no reply. Wait several working days after the first email. Send one follow-up that refers to the first message and repeats the trial offer in fewer words. If there is still no reply, send one second follow-up and then stop. Do not write that they asked for a proposal. Do not invent a deadline they agreed to.",
  "SECTION: AiTC follow-up when they reply. Answer the question they asked. If they ask about hardware, say that AiTC runs in the browser and does not depend on a particular operating system. If they ask about airspace, say that airspace can be created in the platform from their files and that a country airspace can be created within minutes. If they ask about instructors in another location, say that the browser voice system includes video, so the instructor can see the trainee during a remote session.",
  "SECTION: AiTC follow-up when they reply. Next step. After answering, offer a trial on a sample exercise or on airspace they supply. Say that exercises can be previewed in the exercise-creation module, and that artificial intelligence can pilot the aircraft so they do not need a person at the other end. If the reply is a refusal, thank them and do not keep following up.",
  "SECTION: AiTC trial. What to show. A trial shows radar and tower in the browser. It shows an exercise created in the platform and previewed before it is run. It can show aircraft placed by the assistant, then adjusted by hand so the conflict and the traffic peak sit where the instructor wants them. It can show the traffic load in each sector of that exercise. It can show a scripted replay of the session, which is stored as a script rather than as a video.",
  "SECTION: AiTC trial. What the organisation needs. The organisation needs a browser and the computers it already has. It does not need a dedicated operating system and it does not need a human pseudo-pilot for an exercise that uses artificial intelligence piloting. If they want their own airspace, they can provide a simulator file, an aeronautical information publication, or another file that contains the airspace information.",
  "SECTION: AiTC pricing. Licence shapes. AiTC is offered as a per-user licence or as an organisation licence. A per-user licence is a price for each person who uses the platform. An organisation licence is one agreement for an academy, a university, or an air navigation service. AGI Aeronautics states the figure in the written proposal for that organisation. Do not put a price in an email unless that figure is in the proposal you are sending.",
  "SECTION: AiTC pricing. What not to say. Do not quote a network-wide contract as if it were the price of one academy purchase. Do not state a simulator vendor, an ATM system, or a contact email that is not in the organisation record. Do not say that a country has already been contacted unless the correspondence for that location shows a sent message. Do not say that a reply has been received unless the correspondence shows a received message.",
];

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
console.log(`Directory organisations: ${ORGANIZATIONS.length}`);
console.log(`Strategy sections: ${STRATEGY.length}`);
