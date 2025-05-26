"use client";
import BOCButton from "@/components/BOCButton";
import SocialMedia from "@/components/SocialMedia";

import splash_graphic from "@/assets/images/home/splash_graphic.png";

export default function Home() {
  return (
    <div className="h-full w-full">
      {/* Splash Graphic */}
      <img
        src={splash_graphic.src}
        className="w-[45em] h-auto absolute bottom-0 right-0 -z-10"
      />

      {/* Main Body */}
      <div className="px-20 pt-20">
        <div className="">
          <h1 className="text-boc_logo_size text-boc_darkgreen 
          font-funky font-bold mb-4 leading-tight">
            BROWN OUTING <br /> CLUB
          </h1>
        </div>
        <div className="w-[45%]">
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
              onClick={handleMailClick}
              text="Join our Mailing List!"
            ></BOCButton>
          </section>
          <SocialMedia />
        </div>
      </div>
    </div>
  );
}

const handleMailClick = () => {
  window.location.href = "/get-involved";
};
