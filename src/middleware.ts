import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/campaigns") ||
    pathname.startsWith("/calls") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/settings");

  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Get JWT token directly — avoids importing bcryptjs into edge runtime
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  // Unauthenticated → redirect to login
  if ((isDashboardRoute || isAdminRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Non-admin trying to access /admin → redirect to dashboard
  if (isAdminRoute && isLoggedIn && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Already logged in → redirect away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
