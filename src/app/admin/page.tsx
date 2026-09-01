import { redirect } from "next/navigation";

import { AdminPortal } from "@/components/admin/admin-portal";
import { hasValidAdminSession } from "@/lib/admin/session";

export default async function AdminPage() {
  if (!(await hasValidAdminSession())) redirect("/admin/login");
  return <AdminPortal />;
}
