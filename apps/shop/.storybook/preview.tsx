import { createMswHandlers } from "@showcase/mocks";
import { ThemeProvider, type FontName, type SchemeName, type ThemeName } from "@showcase/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Decorator, Preview } from "@storybook/nextjs";
import { mswLoader } from "msw-storybook-addon/csf3";
import { useEffect, useState, type ReactNode } from "react";
import "@showcase/ui/tokens.css";
import "../src/app/globals.css";

function StoryProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: 0, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <div className="min-h-dvh bg-page p-6 font-sans text-ink">{children}</div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function ThemeAttributes({
  theme,
  scheme,
  font,
  children,
}: {
  theme: ThemeName;
  scheme: SchemeName;
  font: FontName;
  children: ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const resolved =
      scheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : scheme;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-scheme", scheme);
    root.setAttribute("data-scheme-resolved", resolved);
    root.setAttribute("data-font", font);
    root.style.colorScheme = resolved;
  }, [theme, scheme, font]);

  return <>{children}</>;
}

const withProviders: Decorator = (Story) => (
  <StoryProviders>
    <Story />
  </StoryProviders>
);

const withThemeAttributes: Decorator = (Story, context) => (
  <ThemeAttributes
    theme={context.globals.theme as ThemeName}
    scheme={context.globals.scheme as SchemeName}
    font={context.globals.font as FontName}
  >
    <Story />
  </ThemeAttributes>
);

/** Maps `parameters.scenario` onto the same mock handlers the app uses. */
const preview: Preview = {
  decorators: [withProviders, withThemeAttributes],
  loaders: [mswLoader()],
  // msw 3 reads handlers from `parameters.msw`; map our `scenario` shorthand onto them.
  beforeEach({ msw, parameters }) {
    msw.use(...createMswHandlers(parameters.scenario as string | undefined));
  },
  initialGlobals: { theme: "ink", scheme: "light", font: "modern" },
  globalTypes: {
    theme: {
      description: "Semantic theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "ink", title: "Ink" },
          { value: "sand", title: "Sand" },
          { value: "forest", title: "Forest" },
        ],
        dynamicTitle: true,
      },
    },
    scheme: {
      description: "Light, dark or system",
      toolbar: {
        title: "Scheme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
    font: {
      description: "Font pairing",
      toolbar: {
        title: "Font",
        icon: "paragraph",
        items: [
          { value: "modern", title: "Modern" },
          { value: "editorial", title: "Editorial" },
          { value: "friendly", title: "Friendly" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: { expanded: true },
    a11y: { test: "error" },
  },
};

export default preview;
