import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const verifyResp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    const verifyData = await verifyResp.json();

    if (!verifyResp.ok || !verifyData.users || verifyData.users.length === 0) {
      console.error("Token verification failed:", verifyData);
      return NextResponse.json(
        { error: "Invalid ID token" },
        { status: 401 }
      );
    }

    const userInfo = verifyData.users[0];

    const sessionData = {
      uid: userInfo.localId,
      email: userInfo.email,
      token: idToken,
      createdAt: Date.now(),
    };

    const cookieStore = await cookies();
    cookieStore.set("firebase_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        uid: userInfo.localId,
        email: userInfo.email,
        displayName: userInfo.displayName || userInfo.email?.split("@")[0] || "User",
        emailVerified: userInfo.emailVerified,
        photoURL: userInfo.photoUrl,
      },
      token: idToken,
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    return NextResponse.json(
      { error: error.message || "Google sign-in failed" },
      { status: 401 }
    );
  }
}
