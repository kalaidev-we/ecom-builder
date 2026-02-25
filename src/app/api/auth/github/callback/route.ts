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
    const sessionUserId = request.cookies.get("gitcommerce_user_id")?.value ?? null;

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("github_username", githubUser.login)
      .maybeSingle();

    const upsertPayload = {
      github_username: githubUser.login,
      github_token: token,
    };

    let userIdToPersist: string | null = null;

    if (sessionUserId) {
      if (existingUser && existingUser.id !== sessionUserId) {
        const { error: moveStoresError } = await supabase
          .from("stores")
          .update({ user_id: existingUser.id })
          .eq("user_id", sessionUserId);
        if (moveStoresError) {
          throw new Error(moveStoresError.message);
        }
        await supabase.from("users").delete().eq("id", sessionUserId).eq("github_token", "");

        const { data, error } = await supabase
          .from("users")
          .update(upsertPayload)
          .eq("id", existingUser.id)
          .select("id")
          .single();
        if (error || !data?.id) {
          throw new Error("Failed to persist GitHub user");
        }
        userIdToPersist = data.id as string;
      } else {
        const { data, error } = await supabase
          .from("users")
          .update(upsertPayload)
          .eq("id", sessionUserId)
          .select("id")
          .single();
        if (error || !data?.id) {
          throw new Error("Failed to upgrade guest to GitHub user");
        }
        userIdToPersist = data.id as string;
      }
    } else {
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
      userIdToPersist = data.id as string;
    }

    const response = NextResponse.redirect(new URL("/deploy", request.url));
    setSessionCookie(response, userIdToPersist);
    response.cookies.set("gitcommerce_oauth_state", "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth callback failed";
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(message)}`, request.url),
    );
  }
}
