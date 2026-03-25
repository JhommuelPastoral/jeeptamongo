import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuth = !!req.auth;
  const path = req.nextUrl.pathname;

  // Allow homepage for unauthenticated users
  if (!isAuth && path === "/") {
    return NextResponse.next();
  }

  // Block dashboard if not logged in
  if (!isAuth && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect logged-in users away from homepage
  if (isAuth && path === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};