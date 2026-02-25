import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getGithubUser } from "@/lib/github";
import { setSessionCookie } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const savedState = request.cookies.get("gitcommerce_oauth_state")?.value;

    if (!code || !state || !savedState || state !== savedState) {
      return NextResponse.redirect(new URL("/?error=invalid_oauth_state", request.url));
    }

    const token = await exchangeCodeForToken(code);
    const githubUser = await getGithubUser(token);

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("github_username", githubUser.login)
      .maybeSingle();

    const upsertPayload = {
      github_username: githubUser.login,
      github_token: token,
    };

    const { data, error } = existingUser
      ? await supabase
          .from("users")
          .update(upsertPayload)
          .eq("id", existingUser.id)
          .select("id")
          .single()
      : await supabase.from("users").insert(upsertPayload).select("id").single();

    if (error || !data?.id) {
      throw new Error("Failed to persist user session");
    }

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    setSessionCookie(response, data.id as string);
    response.cookies.set("gitcommerce_oauth_state", "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth callback failed";
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(message)}`, request.url),
    );
  }
}
