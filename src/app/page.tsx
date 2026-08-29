"use client";
import BOCButton from "@/components/BOCButton";
import SocialMedia from "@/components/SocialMedia";
import { useRouter } from "next/navigation";

import splash_graphic from "@/assets/images/home/splash_graphic.png";

export default function Home() {
  const router = useRouter();
  return (
    <div className="h-full w-full">
      {/* Main Body */}
      <div className="px-6 sm:px-10 desktop:px-20 pt-10">
        <div className="">
          <h1 className="text-[2.25rem] sm:text-5xl md:text-6xl desktop:text-boc_logo_size
          text-boc_darkgreen font-funky font-bold mb-4 leading-tight">
            BROWN OUTING <br /> CLUB
          </h1>
        </div>
        <div className="w-full md:w-[70%] desktop:w-[45%]">
          <section className="flex-auto justify-end mb-8">
            <p className="pb-8">
              The Brown Outing Club facilitates getting students together and
              into the outdoors. The club runs trips throughout the school year
              in New England and along the east coast. The BOC is entirely
              student organized and operated, with new students joining the
              leadership every year. If you are looking to explore the
              mountains, woods, rivers, and bays of the east during college, the
              BOC will help you get there!
            </p>
            <BOCButton
              onClick={() => router.push("/get-involved")}
              text="Join our Mailing List!"
            ></BOCButton>
          </section>
          <SocialMedia />
        </div>
      </div>

      {/* Splash Graphic - a full-bleed block below the content on mobile, where its curved
          top edge reads as a divider; pinned behind the text from `desktop` up */}
      <img
        src={splash_graphic.src}
        alt="BOC members hiking a forest trail in New England"
        className="w-full h-auto max-w-[36em] ml-auto mt-10
        desktop:mt-0 desktop:max-w-none desktop:w-[45em]
        desktop:fixed desktop:bottom-0 desktop:right-0 desktop:-z-10"
      />
    </div>
  );
}
