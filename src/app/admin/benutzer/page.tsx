export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getUsers } from "@/actions/users";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UserList } from "@/components/admin/user-list";
import { CreateUserForm } from "@/components/admin/create-user-form";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <AppShell>
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-white">Benutzer</h1>
      </div>

      <div className="space-y-6">
        <CreateUserForm />
        <UserList users={users} />
      </div>
    </AppShell>
  );
}
