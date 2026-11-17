import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 proxy (formerly middleware). Stores the demo scenario/latency in cookies so a
 * plain page load can drive every mock state; `?scenario=reset` clears them.
 */
export function proxy(request: NextRequest) {
  const scenario = request.nextUrl.searchParams.get("scenario");
  const latency = request.nextUrl.searchParams.get("latency");
  const response = NextResponse.next();

  if (scenario === "reset") {
    response.cookies.delete("demo_scenario");
    response.cookies.delete("demo_latency");
    return response;
  }

  if (scenario) {
    response.cookies.set("demo_scenario", scenario, { sameSite: "lax", path: "/" });
  }
  if (latency) {
    response.cookies.set("demo_latency", latency, { sameSite: "lax", path: "/" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images/).*)"],
};
