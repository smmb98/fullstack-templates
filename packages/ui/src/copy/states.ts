export type EmptyVariant = "first-use" | "no-results" | "cleared";

export const emptyCopy: Record<
  EmptyVariant,
  { title: string; description: string; actionLabel?: string }
> = {
  "first-use": {
    title: "Nothing here yet",
    description: "New pieces arrive weekly. Start with the full collection.",
    actionLabel: "Browse everything",
  },
  "no-results": {
    title: "No matches",
    description: "Try removing a filter or searching for a broader term.",
    actionLabel: "Clear filters",
  },
  cleared: {
    title: "All clear",
    description: "You removed everything from this list.",
    actionLabel: "Undo",
  },
};

export const errorCopy: Record<string, { title: string; description: string }> = {
  network: {
    title: "You are offline",
    description: "Check the connection. We will retry automatically when you are back.",
  },
  timeout: {
    title: "This is taking too long",
    description: "The server did not answer in time. Try again in a moment.",
  },
  http: {
    title: "Something went wrong on our side",
    description: "The page could not load. Try again, and quote the reference if it persists.",
  },
  "not-found": {
    title: "We could not find that",
    description: "The page may have moved. Head back to the collection.",
  },
  unauthorized: {
    title: "Sign in to continue",
    description: "Your session may have expired. Sign in and we will bring you back here.",
  },
  forbidden: {
    title: "No access",
    description: "This area is not available for your account.",
  },
  "rate-limited": {
    title: "Too many requests",
    description: "Give it a moment, then try again.",
  },
  parse: {
    title: "We could not read the response",
    description: "The data arrived in an unexpected shape. Try again.",
  },
};

export const offlineCopy = {
  banner: "You are offline. Saved data stays visible and changes are paused.",
  savedData: "Showing saved data",
  backOnline: "Back online",
};

export const mutationCopy = {
  pending: "Saving...",
  success: "Saved",
  error: "Could not save. Try again.",
};
