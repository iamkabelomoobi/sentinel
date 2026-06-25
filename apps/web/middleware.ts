import { NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(request: NextRequest) {
  const { device } = userAgent(request);

  const isMobileOrTablet =
    device.type === "mobile" || device.type === "tablet";

  if (isMobileOrTablet) {
    return NextResponse.rewrite(
      new URL("/mobile-not-supported", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|mobile-not-supported).*)",
  ],
};