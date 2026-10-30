import { PrismaClient } from "@prisma/client";
import { isCloudflare } from "./runtime";
import { D1_SCHEMA_SQL } from "./d1-schema";
import { seedD1 } from "./d1-seed";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getNodePrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

type CfClient = {
  [model: string]: Record<string, (...args: unknown[]) => Promise<unknown>>;
};

let cfClientPromise: Promise<CfClient> | null = null;

async function loadCloudflarePrisma(): Promise<CfClient> {
  const [{ getCloudflareContext }, { PrismaD1 }, generated] = await Promise.all([
    import("@opennextjs/cloudflare"),
    import("@prisma/adapter-d1"),
    import("@/generated/d1"),
  ]);
  const { env } = getCloudflareContext() as { env: { DB?: { exec: (sql: string) => Promise<unknown> } } };
  if (!env.DB) {
    throw new Error(
      "The D1 database binding is missing. Redeploy so database_agi_aeronautics is attached to this Worker."
    );
  }
  await env.DB.exec(D1_SCHEMA_SQL);
  await env.DB.exec(`ALTER TABLE "Document" ADD COLUMN "audience" TEXT NOT NULL DEFAULT 'PUBLIC'`).catch(() => null);
  const adapter = new PrismaD1(env.DB as ConstructorParameters<typeof PrismaD1>[0]);
  const client = new generated.PrismaClient({ adapter, log: ["error"] });
  await seedD1(client as unknown as Parameters<typeof seedD1>[0]);
  return client as unknown as CfClient;
}

function cloudflareModel(model: string) {
  return new Proxy(
    {},
    {
      get(_target, method) {
        if (typeof method !== "string") return undefined;
        return (...args: unknown[]) => {
          if (!cfClientPromise) cfClientPromise = loadCloudflarePrisma().catch((error) => {
            cfClientPromise = null;
            throw error;
          });
          return cfClientPromise.then((client) => client[model][method].apply(client[model], args));
        };
      },
    }
  );
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!isCloudflare()) {
      const client = getNodePrisma();
      const value = client[prop as keyof PrismaClient];
      if (typeof value === "function") {
        return (value as (...args: unknown[]) => unknown).bind(client);
      }
      return value;
    }
    if (typeof prop !== "string") return undefined;
    return cloudflareModel(prop);
  },
});
