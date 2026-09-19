import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <main className="login-wrap">
      <section className="login-card">
        <a href="/" className="brand"><span className="brand-dot" /> MEMORA</a>
        <h1>Welcome back.</h1>
        <p>This is the private side of MEMORA. Visitors never see this screen.</p>
        <LoginForm />
      </section>
    </main>
  );
}
