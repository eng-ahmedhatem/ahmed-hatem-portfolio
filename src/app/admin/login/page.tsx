import { redirect } from "next/navigation";

import { AdminLogin } from "@/components/admin/admin-login";
import { hasValidAdminSession } from "@/lib/admin/session";

export default async function AdminLoginPage() {
  if (await hasValidAdminSession()) redirect("/admin");
  return <AdminLogin />;
}
