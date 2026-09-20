import Link from "next/link";
import { redirect } from "next/navigation";
import { OwnerLoginForm } from "@/components/OwnerLoginForm";
import { getOwnerId } from "@/lib/auth";
export default async function OwnerLoginPage() { if (await getOwnerId()) redirect("/my-memories"); return <main className="login-wrap"><section className="login-card"><Link href="/" className="brand"><span className="brand-dot" /> MEMORA</Link><h1>Your memories</h1><p>Sign in to see every memory connected to your claimed shirt.</p><OwnerLoginForm /></section></main>; }
