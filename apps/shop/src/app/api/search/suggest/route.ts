import { handleSearchSuggest } from "@fullstack-templates/mocks";

export const dynamic = "force-dynamic";

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/** Mock API route. Scenario cookies and query params are ignored outside demo mode. */
export function GET(request: Request) {
  if (demoMode) return handleSearchSuggest(request);

  const url = new URL(request.url);
  url.searchParams.delete("scenario");
  url.searchParams.delete("latency");
  const headers = new Headers(request.headers);
  headers.delete("cookie");
  return handleSearchSuggest(new Request(url, { headers }));
}
