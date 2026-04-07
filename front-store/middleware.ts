import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { i18n } from "./i18n-config";

const { locales, defaultLocale } = i18n;

function isValidLocale(locale: string): boolean {
  try {
    return Intl.getCanonicalLocales(locale).length > 0;
  } catch {
    return false;
  }
}

function getLocale(request: NextRequest): string {
  const localesString = locales
    .map((item) => item.lang)
    .filter(isValidLocale);

  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const languages = new Negotiator({ headers: negotiatorHeaders })
    .languages()
    .filter(isValidLocale);

  if (localesString.length === 0 || !isValidLocale(defaultLocale)) {
    return "en";
  }

  if (languages.length === 0) {
    return defaultLocale;
  }

  return match(languages, localesString, defaultLocale);
}

/**Clerk middleware */
const isAuthRoute = createRouteMatcher(["/customer/(.*)", "/track-order/(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // if (process.env.NODE_ENV === "development") return NextResponse.next();
  const { isSignedIn } = await clerkClient.authenticateRequest(request);

  /*Pages protections*/
  // Protected url access pages for sellers
  if (isAuthRoute(request) && !isSignedIn)
    auth().protect({
      unauthenticatedUrl: process.env.NEXT_PUBLIC_SERVER_URL + "/sign-in",
    });

  //Rewrite URL for locale
  let response, nextLocale;

  const { basePath } = request.nextUrl;

  // Redirect if there is no locale
  const pathLocale = locales.find(
    (locale) =>
      pathname.startsWith(`/${locale.lang}/`) || pathname === `/${locale.lang}`
  );

  // a local is found
  if (pathLocale) {
    const isDefaultLocale = pathLocale.lang === defaultLocale;
    if (isDefaultLocale) {
      let pathWithoutLocale =
        pathname.slice(`/${pathLocale.lang}`.length) || "/";
      if (request.nextUrl.search) pathWithoutLocale += request.nextUrl.search;
      const url = basePath + pathWithoutLocale;
      response = NextResponse.redirect(new URL(url, request.url));
    }
    nextLocale = pathLocale.lang;
  }

  // a local is not found cause either is hidden for default or user is new to website
  else {
    const hasLocale = request.cookies.has("NEXT_LOCALE");
    const locale = hasLocale ? defaultLocale : getLocale(request);
    let newPath = `/${locale}${pathname}`;
    if (request.nextUrl.search) newPath += request.nextUrl.search;
    const url = basePath + newPath;
    response =
      locale === defaultLocale
        ? NextResponse.rewrite(new URL(url, request.url))
        : NextResponse.redirect(new URL(url, request.url));
    nextLocale = locale;
  }

  if (!response) response = NextResponse.next();
  if (nextLocale) response.cookies.set("NEXT_LOCALE", nextLocale);
  return response;
});

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Optional: only run on root (/) URL
    // '/'
  ],
};
