import bcrypt from "bcryptjs";
import { ORGANIZATIONS } from "../../prisma/data/organizations";

type SeedClient = {
  user: {
    upsert: (args: {
      where: { email: string };
      update: { name: string; passwordHash: string; role: string };
      create: { email: string; name: string; passwordHash: string; role: string };
    }) => Promise<unknown>;
  };
  organization: {
    count: () => Promise<number>;
    create: (args: {
      data: {
        name: string;
        kind: string;
        country: string;
        city: string;
        lat: number;
        lng: number;
        website?: string;
        atmSystem?: string;
        notes?: string;
        contacts?: { create: { email: string; title: string }[] };
      };
    }) => Promise<unknown>;
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

  if ((await prisma.organization.count()) > 0) return;

  for (const org of ORGANIZATIONS) {
    await prisma.organization.create({
      data: {
        name: org.name,
        kind: org.kind,
        country: org.country,
        city: org.city,
        lat: org.lat,
        lng: org.lng,
        website: org.website,
        atmSystem: org.atmSystem,
        notes: org.notes,
        contacts: org.email
          ? { create: [{ email: org.email, title: org.contactTitle || "Public enquiry" }] }
          : undefined,
      },
    });
  }
}
