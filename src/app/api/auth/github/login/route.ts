import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { ensureEnv, env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  ensureEnv(["githubClientId"]);
  const state = randomUUID();
  const callbackUrl = `${env.appUrl}/api/auth/github/callback`;
  const authUrl = new URL("https://github.com/login/oauth/authorize");

  authUrl.searchParams.set("client_id", env.githubClientId);
  authUrl.searchParams.set("redirect_uri", callbackUrl);
  authUrl.searchParams.set("scope", "read:user user:email repo");
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("gitcommerce_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
