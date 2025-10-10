import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Allowed origins for CORS (only for API requests)
const allowedOrigins = ["https://magic-slides-1l22.vercel.app", "http://localhost:3000"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  

  // --- CORS for API routes ---
  if (pathname.startsWith("/api")) {
    const origin = req.headers.get("origin") || "";
    const res = NextResponse.next();

    if (allowedOrigins.includes(origin)) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: res.headers });
    }

    // Allow API requests to continue
    return res;
  }

  // --- Protect all other routes ---
  const token = req.cookies.get("next-auth.session-token")?.value 
                || req.cookies.get("__Secure-next-auth.session-token")?.value;

   //  If user already logged in and tries to access /login -> redirect to home
  if (token && pathname==='/login') {
    
    
    return NextResponse.redirect(new URL("/", req.url));
  }

  //  If user not logged in and tries to access protected route -> redirect to login
  if (
    !token &&
    !["/login", "/signup", "/forgot-password"].includes(pathname)
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!signup|forgot-password|api/auth|public|_next/static|favicon.ico).*)",
  ],
};
