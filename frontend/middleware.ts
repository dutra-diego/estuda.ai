import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

async function verifyToken(token: string) {
	if (!token) return null;
	try {
		const secret = new TextEncoder().encode(process.env.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret);
		return payload;
	} catch (_error) {
		return null;
	}
}

export async function middleware(request: NextRequest) {
	const token = request.cookies.get("authToken")?.value;
	const payload = await verifyToken(token || "");
	const userRole = payload?.role;
	const currentPath = request.nextUrl.pathname;
	if (!payload) {
		if (currentPath !== "/") {
			return NextResponse.redirect(new URL("/", request.url));
		}

		return NextResponse.next();
	}

	if (userRole === "student") {
		if (!currentPath.startsWith("/chat")) {
			return NextResponse.redirect(new URL("/chat", request.url));
		}
	}

	if (userRole === "teacher") {
		if (!currentPath.startsWith("/classes")) {
			return NextResponse.redirect(new URL("/classes", request.url));
		}
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/chat/:path*", "/classes/:path*"],
};
