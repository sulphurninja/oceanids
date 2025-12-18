import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OceanIDs - Premium IRCTC Accounts",
  description: "Get verified IRCTC accounts instantly. Premium, verified accounts for hassle-free train ticket booking. Trusted by thousands.",
  keywords: "IRCTC, IRCTC account, train booking, Indian Railways, verified accounts, premium accounts",
  authors: [{ name: "OceanIDs Team" }],
  openGraph: {
    title: "OceanIDs - Premium IRCTC Accounts",
    description: "Get verified IRCTC accounts instantly. Premium, verified accounts for hassle-free train ticket booking.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
