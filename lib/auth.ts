import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "memora_admin";
const OWNER_COOKIE_NAME = "memora_owner";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type Session = { email: string; exp: number; nonce: string };

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encode(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(value: string): Session | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    if (!session.email || !session.exp || session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

function verifyPassword(password: string, encoded: string) {
  const [scheme, salt, expectedHex] = encoded.split(":");
  if (scheme !== "scrypt" || !salt || !expectedHex) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyStoredPassword(password: string, encoded: string) {
  return verifyPassword(password, encoded);
}

export function isConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.SESSION_SECRET);
}

export function authenticate(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const encoded = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !encoded) return false;
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase() && verifyPassword(password, encoded);
}

export async function createSession(email: string) {
  const value = encode({ email, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS, nonce: randomBytes(12).toString("hex") });
  const jar = await cookies();
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession() {
  const jar = await cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  return value ? decode(value) : null;
}

export async function createOwnerSession(ownerId: number) {
  const jar = await cookies();
  jar.set(OWNER_COOKIE_NAME, encode({ email: String(ownerId), exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS, nonce: randomBytes(12).toString("hex") }), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: MAX_AGE_SECONDS,
  });
}

export async function getOwnerId() {
  const jar = await cookies();
  const session = decode(jar.get(OWNER_COOKIE_NAME)?.value ?? "");
  const ownerId = Number(session?.email);
  return Number.isInteger(ownerId) && ownerId > 0 ? ownerId : null;
}

export async function clearOwnerSession() {
  const jar = await cookies();
  jar.delete(OWNER_COOKIE_NAME);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
