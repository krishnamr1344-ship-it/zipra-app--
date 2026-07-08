import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import firebaseApp from "@/lib/firebase/app";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const auth = getAuth(firebaseApp);
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const idToken = await userCredential.user.getIdToken();
    const re = userCredential.user.toJSON();

    const sessionData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      token: idToken,
      refreshToken: userCredential.user.refreshToken,
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
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified,
      },
      token: idToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    const status = error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential" ? 401 : 500;
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status }
    );
  }
}
