import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { SESSION_COOKIE } from "@/lib/session";
import { User } from "@/types";

export const getCurrentUserFromRequest = async (
  request: NextRequest,
): Promise<User | null> => {
  const userId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as User;
};

export const getCurrentUserById = async (
  userId: string | null,
): Promise<User | null> => {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as User;
};
