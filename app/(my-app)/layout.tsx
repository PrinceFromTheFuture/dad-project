import type { Metadata } from "next";
import {
  Oswald,
  Dancing_Script,
  Noto_Sans,
  Roboto,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Condensed,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const oswald = IBM_Plex_Sans_Condensed({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Report Flow",
  description: "BTL-Report Generaor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable}  antialiased`}
        style={{ fontFamily: "var(--font-oswald), Oswald, sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
