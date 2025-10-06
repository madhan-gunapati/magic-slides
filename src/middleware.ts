import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of allowed origins
const allowedOrigins = ["https://magic-slides-1l22.vercel.app", "http://localhost:3000"];

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  
  const res = NextResponse.next();

  if (allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: res.headers,
    });
  }

  return res;
}

// Apply middleware only to API routes
export const config = {
  matcher: "/api/:path*",
};
