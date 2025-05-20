"use client";
import bear_vector from "@/assets/images/logo.svg";
import SignIn from "@/components/SignIn";
import { usePathname } from "next/navigation";

function NavButton(props: { children: React.ReactNode; func: () => void }) {
  const pathname = usePathname();
  return (
    <button
      onClick={() => {
        window.location.href = props.url;
      }}
      className={`py-2 px-4 rounded-lg cursor-pointer font-montserrat font-bold text-[18px]
      ${props.url == pathname ? "bg-boc_darkgreen text-white" : "bg-transparent text-boc_darkbrown"}`}
    >
      {props.children}
    </button>
  );
}

function NavBar() {
  return (
    <div className="w-screen flex justify-between px-8 py-4 z-10">
      <a href="/">
        <img
          src={bear_vector.src}
          alt="Bear Vector"
          className="cursor-pointer"
        />
      </a>
      <div className="flex space-x-5 py-4">
        <NavButton url="/">HOME</NavButton>
        <NavButton url="/about">ABOUT</NavButton>
        <NavButton url="/trips">TRIPS</NavButton>
        <NavButton url="/gear-room">GEARS</NavButton>
        <NavButton url="/contact">CONTACT</NavButton>
        <SignIn />
      </div>
    </div>
  );
}

export default NavBar; // Make sure to export the component
