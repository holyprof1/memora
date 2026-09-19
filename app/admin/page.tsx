import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return <AdminDashboard email={session.email} />;
}
