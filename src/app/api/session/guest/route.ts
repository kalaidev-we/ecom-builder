import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { getOrCreateStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const existingUser = await getCurrentUserFromRequest(request);
  if (existingUser) {
    return NextResponse.json({ userId: existingUser.id, guest: existingUser.github_token === "" });
  }

  const guestUsername = `guest-${randomUUID()}`;
  const { data, error } = await supabase
    .from("users")
    .insert({
      github_username: guestUsername,
      github_token: "",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return NextResponse.json({ error: "Unable to create guest session" }, { status: 500 });
  }

  await getOrCreateStore(data.id);

  const response = NextResponse.json({ userId: data.id, guest: true });
  setSessionCookie(response, data.id as string);
  return response;
}
