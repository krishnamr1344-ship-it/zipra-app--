import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUserWithEmailAndPassword, updateProfile, getAuth } from "firebase/auth";
import firebaseApp from "@/lib/firebase/app";

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

    const auth = getAuth(firebaseApp);
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    const idToken = await userCredential.user.getIdToken();

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
        displayName: displayName || userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified,
      },
      token: idToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 400 }
    );
  }
}
