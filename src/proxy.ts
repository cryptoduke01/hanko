import { NextResponse, type NextRequest } from "next/server";

/**
 * Geoblock for the real-securities product. Backpack Securities is not offered
 * in these jurisdictions (and xStocks are not available to US persons), so when
 * Hanko serves real securities we block them. Enforced only on a non-devnet
 * cluster: the devnet demo uses test tokens and stays open to everyone (judges
 * included). Country comes from Vercel's edge geo header.
 *
 * Next 16 file convention: `proxy.ts` (the former `middleware.ts`).
 */
const RESTRICTED = new Set([
  "US", // United States (and US persons)
  "GB", // United Kingdom
  "AE", // United Arab Emirates
  "JP", // Japan
  "KP",
  "IR",
  "SY",
  "CU", // sanctioned
]);

export function proxy(request: NextRequest) {
  // Demo (devnet) is open; only the real-securities deployment geoblocks.
  if ((process.env.NEXT_PUBLIC_CLUSTER ?? "devnet") === "devnet") {
    return NextResponse.next();
  }
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  if (RESTRICTED.has(country)) {
    const url = request.nextUrl.clone();
    url.pathname = "/restricted";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // Skip static assets, api, and the restricted page itself.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|api|restricted).*)",
  ],
};
