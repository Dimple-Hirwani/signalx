import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalX",
  description: "Signal-inspired secure messaging platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
         * Synchronous dark-mode script: reads localStorage before the first
         * paint so there is no flash of the wrong theme.
         * suppressHydrationWarning on <html> is required because the class
         * attribute is set client-side before React hydration.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
