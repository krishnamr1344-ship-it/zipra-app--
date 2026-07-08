import { NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/profile", "/orders", "/cart", "/wishlist",
  "/checkout", "/payment", "/settings", "/notifications",
];

const ADMIN_ROUTES = ["/admin"];

const AUTH_ROUTES = ["/auth/login"];

function isProtectedRoute(pathname) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isAdminRoute(pathname) {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname) {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get("firebase_session");
  const user = sessionCookie ? parseSessionCookie(sessionCookie.value) : null;

  if (isAuthRoute(pathname)) {
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute(pathname)) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAdminRoute(pathname)) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (user.email !== adminEmail) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

function parseSessionCookie(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api(?!/auth)).*)",
  ],
};
