import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ORGANIZATIONS, organizationSeedData, publishedContacts } from "./data/organizations";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "AGI Administrator";

  if (!email || !password) {
    console.log(
      "[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping admin bootstrap."
    );
  } else {
    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        role: "SUPERADMIN",
      },
      create: {
        email,
        name,
        passwordHash,
        role: "SUPERADMIN",
      },
    });

    console.log(`[seed] Super admin ready: ${admin.email}`);
  }

  let created = 0;
  let updated = 0;
  for (const org of ORGANIZATIONS) {
    const data = organizationSeedData(org);
    const contacts = publishedContacts(org);
    const exists = await prisma.organization.findUnique({
      where: { name: org.name },
      include: { contacts: true },
    });
    if (!exists) {
      await prisma.organization.create({
        data: {
          ...data,
          contacts: contacts.length ? { create: contacts } : undefined,
        },
      });
      created += 1;
      continue;
    }
    await prisma.organization.update({ where: { name: org.name }, data });
    const have = new Set(exists.contacts.map((contact) => contact.email?.toLowerCase()).filter(Boolean));
    for (const contact of contacts) {
      if (have.has(contact.email.toLowerCase())) continue;
      await prisma.contact.create({ data: { organizationId: exists.id, email: contact.email, title: contact.title } });
    }
    updated += 1;
  }
  console.log(`[seed] Organizations added: ${created}, updated: ${updated}`);
}

main()
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
