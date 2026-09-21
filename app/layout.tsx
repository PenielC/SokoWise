import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "SokoWise | Find affordable prices near you",
    template: "%s | SokoWise",
  },
  description:
    "SokoWise is a community-powered platform that helps you discover, compare, and verify affordable local product prices — including sellers who don't have an online presence.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-mist text-ink-900">{children}</body>
    </html>
  );
}
