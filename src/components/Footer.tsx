"use client";
import Image from "next/image";
import Link from "next/link";
import BOCLogo from "@/assets/images/footer/boc_logo.png";
import BOCBackground from "@/assets/images/footer/footer_bg.png";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className={`${pathname == "/" ? "hidden" : ""} relative text-[#fcecc5] px-6 py-10 h-52 overflow-hidden`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-start items-start gap-20 h-full">
        <div className="absolute inset-0 -z-20 -bottom-200 opacity-75">
          <Image
            src={BOCBackground.src}
            alt="Footer background"
            fill
            className="object-cover object-bottom"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-[#FF8A2A] opacity-30 -z-0" />
        {/* Logo and Copyright */}
        <div className="flex flex-col items-start z-10">
          <div className="relative h-28 w-40">
            <Image
              src={BOCLogo.src}
              alt="Brown Outing Club Logo"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <p className="text-sm text-boc_earthyorange">© 2025 Brown Outing Club</p>
        </div>
        {/* Bar Spacer */}
        <div className="h-full my-auto w-1 bg-boc_earthyorange"/>
        {/* Key Links */}
        <div className="z-10 text-boc_earthyorange">
          <h3 className="font-bold text-lg mb-2">KEY LINKS</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/trips" className="hover:underline">
                Trips
              </Link>
            </li>
            <li>
              <Link href="/gear-room" className="hover:underline">
                Gears
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div className="z-10 text-boc_earthyorange">
          <h3 className="font-bold text-lg mb-2">FOLLOW US!</h3>
          <ul className="space-y-1">
            <li>
              <a
                href="https://www.instagram.com/brownoutingclub/?hl=en"
                target="_blank"
                className="hover:underline"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/brownoutingclub/"
                target="_blank"
                className="hover:underline"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
