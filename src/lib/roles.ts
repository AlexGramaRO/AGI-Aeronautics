export type AppRole = "USER" | "ADMIN" | "SUPERADMIN";

export function isStaffRole(role: string | null | undefined) {
  return role === "ADMIN" || role === "SUPERADMIN";
}
