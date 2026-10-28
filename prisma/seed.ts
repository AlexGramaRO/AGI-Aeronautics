import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ORGANIZATIONS } from "./data/organizations";

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
  for (const org of ORGANIZATIONS) {
    const exists = await prisma.organization.findUnique({ where: { name: org.name } });
    if (exists) continue;
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
    created += 1;
  }
  console.log(`[seed] Organizations added: ${created}`);
}

main()
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
