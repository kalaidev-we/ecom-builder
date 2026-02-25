import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "gitcommerce_user_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const setSessionCookie = (response: NextResponse, userId: string) => {
  response.cookies.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

export const getSessionUserId = async (): Promise<string | null> => {
  const cookieStore = cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
};
