import { OfflineBanner, themeInitScript, ThemeProvider } from "@showcase/ui";
import type { Metadata } from "next";
import { Fraunces, Inter, Nunito, Open_Sans, Outfit, Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "@showcase/ui/tokens.css";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Hearth & Grain",
    template: "%s | Hearth & Grain",
  },
  description: "Objects for the everyday home: furniture, lighting, kitchen, bedding and decor.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="ink"
      data-scheme="system"
      data-font="modern"
      suppressHydrationWarning
      className={[
        outfit.variable,
        inter.variable,
        fraunces.variable,
        sourceSans.variable,
        nunito.variable,
        openSans.variable,
      ].join(" ")}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-page font-sans text-ink antialiased">
        <ThemeProvider>
          <Providers>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
            >
              Skip to content
            </a>
            <header className="border-b border-line bg-surface">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
                <Link href="/" className="font-display text-xl tracking-tight text-ink">
                  Hearth &amp; Grain
                </Link>
                <nav aria-label="Main" className="flex items-center gap-6 text-sm">
                  <Link href="/" className="text-muted hover:text-ink">
                    Home
                  </Link>
                  <Link href="/products" className="text-muted hover:text-ink">
                    Collection
                  </Link>
                </nav>
              </div>
            </header>
            <main id="main" className="flex-1">
              {children}
            </main>
            <footer className="border-t border-line bg-surface">
              <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>Hearth &amp; Grain, since 1998. Fictional store for demonstration.</p>
                <p>Made for slow homes.</p>
              </div>
            </footer>
            <OfflineBanner />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
