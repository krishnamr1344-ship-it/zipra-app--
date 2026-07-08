import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("firebase_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "No active session" },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    const refreshResp = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: sessionData.refreshToken || "",
        }),
      }
    );

    const refreshData = await refreshResp.json();

    if (!refreshResp.ok || !refreshData.id_token) {
      cookieStore.delete("firebase_session");
      return NextResponse.json(
        { error: "Token refresh failed" },
        { status: 401 }
      );
    }

    const newToken = refreshData.id_token;
    const newRefreshToken = refreshData.refresh_token;
    const expiresIn = refreshData.expires_in;

    sessionData.token = newToken;
    if (newRefreshToken) sessionData.refreshToken = newRefreshToken;

    cookieStore.set("firebase_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      token: newToken,
      expiresIn,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: error.message || "Token refresh failed" },
      { status: 500 }
    );
  }
}
