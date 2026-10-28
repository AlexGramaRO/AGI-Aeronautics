import bcrypt from "bcryptjs";
import { ORGANIZATIONS, organizationSeedData, publishedContacts } from "../../prisma/data/organizations";

type SeedClient = {
  user: {
    upsert: (args: {
      where: { email: string };
      update: { name: string; passwordHash: string; role: string };
      create: { email: string; name: string; passwordHash: string; role: string };
    }) => Promise<unknown>;
  };
  organization: {
    findUnique: (args: {
      where: { name: string };
      include: { contacts: true };
    }) => Promise<{ id: string; contacts: { email: string | null }[] } | null>;
    update: (args: { where: { name: string }; data: Record<string, unknown> }) => Promise<unknown>;
    create: (args: {
      data: Record<string, unknown> & {
        contacts?: { create: { email: string; title: string }[] };
      };
    }) => Promise<unknown>;
  };
  contact: {
    create: (args: { data: { organizationId: string; email: string; title: string } }) => Promise<unknown>;
  };
};

export async function seedD1(prisma: SeedClient) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "AGI Administrator";

  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash, role: "SUPERADMIN" },
      create: { email, name, passwordHash, role: "SUPERADMIN" },
    });
  }

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
      continue;
    }
    await prisma.organization.update({ where: { name: org.name }, data });
    const have = new Set(exists.contacts.map((contact) => contact.email?.toLowerCase()).filter(Boolean));
    for (const contact of contacts) {
      if (have.has(contact.email.toLowerCase())) continue;
      await prisma.contact.create({
        data: { organizationId: exists.id, email: contact.email, title: contact.title },
      });
    }
  }
}
