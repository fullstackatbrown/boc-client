"use client";
import NavBar from "@/components/NavBar";
import GreenButton from "@/components/GreenButton";
import SocialMedia from "@/components/SocialMedia";
import PawPrints from "@/components/PawPrints";

import splash_graphic from "@/assets/images/splash_graphic.png";

export default function Home() {
  return (
    <div className="w-screen h-screen absolute z-0">
      {/* Top Bar of nav options and bear logo*/}
      <NavBar></NavBar>

      {/* Splash Graphic */}
      <img
        src={splash_graphic.src}
        className="w-[45em] h-auto absolute bottom-0 right-0 -z-10"
      />

      {/* Main Body */}
      <div className="absolute w-[95%] top-[5em]">
        <div className="ml-20 pl-9 mt-20">
          <h1 className="text-boc_logo_size text-boc_darkgreen 
          font-funky font-bold mb-4 leading-tight">
            BROWN OUTING <br /> CLUB
          </h1>
        </div>
        <div className="pl-9 w-[45%] ml-20">
          <section className="flex-auto justify-end mb-8">
            <p className="mb-2 text-black font-montserrat pb-8">
              The Brown Outing Club facilitates getting students together and
              into the outdoors. The club runs trips throughout the school year
              in New England and along the east coast. The BOC is entirely
              student organized and operated, with new students joining the
              leadership every year. If you are looking to explore the
              mountains, woods, rivers, and bays of the east during college, the
              BOC will help you get there!
            </p>
            <GreenButton
              onClick={handleExploreClick}
              text="EXPLORE!"
            ></GreenButton>
          </section>
          <SocialMedia></SocialMedia>
        </div>
        <PawPrints></PawPrints>
      </div>
    </div>
  );
}

const handleExploreClick = () => {
  window.location.href = "/trips";
};
