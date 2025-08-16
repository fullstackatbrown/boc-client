import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SessionProvider } from "next-auth/react";

import { chelseaMarket, gabarito } from "@/styles/fonts.ts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Brown Outing Club",
  description: "Brown Unversity Outing Club",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html
        lang="en"
        className={`${chelseaMarket.className} ${gabarito.className}`}
      >
        <body className="bg-background font-standard text-[18px] min-h-screen flex flex-col">
          <div className="min-h-screen">
            <Header />
            {children}
            <div id="popup-root" />
          </div>
          <Footer />
        </body>
      </html>
    </SessionProvider>
  );
}
