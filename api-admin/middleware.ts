import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


const isAuthRoute = createRouteMatcher(["/stores(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // if (process.env.NODE_ENV === "development") return NextResponse.next();


  // Handle preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400", // 24 hours cache
      },
    });
  }


  const { isSignedIn } = await clerkClient.authenticateRequest(req);

  /*Pages protections*/
  // Protected url access pages for sellers
  if (isAuthRoute(req) && !isSignedIn)
    auth().protect({
      unauthenticatedUrl: process.env.NEXT_PUBLIC_SERVER_URL + "/sign-in",
    });

  // Protected url access pages for admin
  if (isAdminRoute(req) && auth().sessionClaims?.metadata.role === undefined) {
    return NextResponse.redirect(new URL("/unthorized", req.url));
  }
  /*Pages protections*/

  // protected Origin

  /*Api url protections*/
  // Protected api for admin that needs auth and admin role to proceed
  if (req.nextUrl.pathname.startsWith("/api/admin")) {
    if (auth().sessionClaims?.metadata.role !== "admin") {
      return Response.json({
        status: 401,
        message: "you are not authorized as admin",
      });
    }
  }

  //Api for user that needs auth to proceed
  if (req.nextUrl.pathname.startsWith("/api/user")) {
    if (!isSignedIn) {
      return Response.json({
        status: 401,
        message: "you are not authenticated (token auth failed)",
      });
    }
  }

  const response = NextResponse.next();
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
