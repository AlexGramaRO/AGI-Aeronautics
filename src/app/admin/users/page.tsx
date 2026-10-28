"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  role: "USER" | "ADMIN" | "SUPERADMIN";
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(async (res) => {
        if (res.status === 403) {
          router.replace("/admin");
          return;
        }
        const data = await res.json();
        setUsers(data.users || []);
      })
      .catch(() => setError("Could not load users."));
  }, [router]);

  async function changeRole(id: string, role: "USER" | "ADMIN") {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update the role.");
      return;
    }
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, role: data.user.role } : user)));
  }

  return (
    <div>
      <h2 className="text-[28px] font-semibold tracking-tight text-ink">People</h2>
      <p className="mt-2 text-[15px] text-muted">Make a user an admin, or return them to a regular account.</p>
      {error && <p className="mt-4 text-[15px] text-[#bf4800]">{error}</p>}
      <div className="mt-6 space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-canvas px-5 py-4">
            <div>
              <p className="text-[17px] text-ink">{user.name}</p>
              <p className="text-[13px] text-muted">
                {user.email}
                {user.organization ? ` · ${user.organization}` : ""}
              </p>
            </div>
            {user.role === "SUPERADMIN" ? (
              <span className="text-[13px] text-muted">Super admin</span>
            ) : (
              <select
                className="field !w-auto"
                value={user.role}
                onChange={(event) => changeRole(user.id, event.target.value as "USER" | "ADMIN")}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
