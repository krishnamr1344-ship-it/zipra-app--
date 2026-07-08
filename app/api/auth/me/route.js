import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("firebase_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Not authenticated" },
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

    const token = sessionData.token;
    if (!token) {
      return NextResponse.json(
        { error: "No token in session" },
        { status: 401 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const verifyResp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );

    const verifyData = await verifyResp.json();

    if (!verifyResp.ok || !verifyData.users || verifyData.users.length === 0) {
      cookieStore.delete("firebase_session");
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }

    const userInfo = verifyData.users[0];

    return NextResponse.json({
      success: true,
      user: {
        uid: userInfo.localId,
        email: userInfo.email,
        displayName: userInfo.displayName || sessionData.email?.split("@")[0] || "User",
        emailVerified: userInfo.emailVerified,
        photoURL: userInfo.photoUrl,
        phoneNumber: userInfo.phoneNumber,
        createdAt: userInfo.createdAt,
        lastLoginAt: userInfo.lastLoginAt,
        providerId: userInfo.providerUserInfo?.[0]?.providerId || "email",
      },
      hasSession: true,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user" },
      { status: 500 }
    );
  }
}
