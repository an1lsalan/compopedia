import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = ["/", "/login", "/register", "/components", "/components/[id]"];

const isPublicPath = (path: string) => {
    return publicPaths.some(
        (publicPath) => path === publicPath || (publicPath.includes("[") && path.startsWith(publicPath.split("/").slice(0, -1).join("/")))
    );
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is public
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // Check if the user is authenticated
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect to login if not authenticated
    if (!token) {
        const url = new URL("/login", request.url);
        url.searchParams.set("callbackUrl", encodeURI(request.url));
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
