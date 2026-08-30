import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SessionProvider } from "next-auth/react";

import { chelseaMarket, gabarito } from "@/styles/fonts";
import "@/styles/globals.css";
import ConsoleBear from "@/components/PrintBear";

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
          {/* The mobile-view blocker that used to live here is gone - every page has a
              mobile view now. Its old note said to drop this <main> along with it, but
              min-h-screen here and below is what pads a short page down to the footer,
              so removing it would reflow every page. */}
          <main className="flex flex-col min-h-screen">
            <div className="min-h-screen">
              <Header />
              {children}
              <div id="popup-root" />
            </div>
            <Footer />
          </main>
          {/* For Funnsies */}
          <ConsoleBear/>
        </body>
      </html>
    </SessionProvider>
  );
}
