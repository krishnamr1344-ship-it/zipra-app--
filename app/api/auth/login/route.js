import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await resp.json();

    if (!resp.ok) {
      const code = data.error?.message || "INVALID_LOGIN";
      let status = 401;
      if (code === "EMAIL_NOT_FOUND" || code === "INVALID_PASSWORD" || code === "INVALID_LOGIN_CREDENTIALS") status = 401;
      else if (code === "USER_DISABLED") status = 403;
      else if (code === "TOO_MANY_ATTEMPTS_TRY_LATER") status = 429;
      return NextResponse.json(
        { error: data.error?.message || "Invalid email or password" },
        { status }
      );
    }

    const sessionData = {
      uid: data.localId,
      email: data.email,
      token: data.idToken,
      refreshToken: data.refreshToken,
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
        uid: data.localId,
        email: data.email,
        displayName: data.displayName || email.split("@")[0],
        emailVerified: !!data.emailVerified,
      },
      token: data.idToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
