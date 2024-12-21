import { auth } from "auth";

import { NextResponse } from "next/server";

export default auth(async function middleware(req) {
    if (
        !req.auth &&
        !req.nextUrl.pathname.startsWith("/auth") &&
        !req.nextUrl.pathname.startsWith("/api/auth")
    ) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};
