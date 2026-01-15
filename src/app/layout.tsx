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
          {/* Mobile View Blocker */}
          <div className="[@media(min-width:1150px)]:hidden fixed inset-0 bg-boc_slate text-boc_lightbrown flex flex-col items-center justify-center z-[1000] p-6">
            <h1 className="text-3xl font-bold mb-4 text-center">Site Not Available on Smaller Screens Yet :(</h1>
            <p className="text-center text-lg">
              We're still working on views for smaller screens! If you'd like to help us make those
              happen, <a href="mailto:william_l_stone@brown.edu;samuel_bradley@brown.edu;alan_wang2@brown.edu" className="underline">shoot us an email</a>; we'd love the help! Regardless, please visit from a laptop or desktop for now.
            </p>
          </div>
          {/* Page Contents - When mobile blocker is removed, just remove this main tag completely */}
          <main className="hidden [@media(min-width:1150px)]:flex flex-col min-h-screen">
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
