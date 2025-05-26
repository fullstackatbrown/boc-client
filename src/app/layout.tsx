import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LoginProvider } from "@/contexts/LoginContext";
import { SessionProvider } from "next-auth/react";
import { Chelsea_Market, Gabarito } from "next/font/google";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Brown Outing Club",
  description: "Brown Unversity Outing Club",
};

export const chelseaMarket = Chelsea_Market({
  weight: "400", // Chelsea Market only has one weight
  subsets: ["latin"],
  display: "swap",
});

export const gabarito = Gabarito({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "default_client_id";
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
          </div>
          <Footer />
        </body>
      </html>
    </SessionProvider>
  );
}
