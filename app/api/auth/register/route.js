import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
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
      const code = data.error?.message || "REGISTRATION_FAILED";
      let status = 400;
      if (code === "EMAIL_EXISTS") status = 409;
      else if (code === "WEAK_PASSWORD") status = 422;
      return NextResponse.json(
        { error: data.error?.message || "Registration failed" },
        { status }
      );
    }

    // Update display name via setAccountInfo
    if (displayName) {
      await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken: data.idToken,
            displayName,
            returnSecureToken: true,
          }),
        }
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
        displayName: displayName || email.split("@")[0],
        emailVerified: !!data.emailVerified,
      },
      token: data.idToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
