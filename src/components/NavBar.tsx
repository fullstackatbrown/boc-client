"use client";
import bear_vector from "@/assets/images/bear_vector.svg";
import SignIn from "@/components/SignIn";
import { usePathname } from 'next/navigation'

function NavButton(props: { children: React.ReactNode; func: () => void }) {
  const pathname = usePathname();
  return (
    <button
      onClick={() => {
        window.location.href = props.url;
      }}
      className={`py-2 
      px-4 rounded-lg cursor-pointer 
      ${props.url == pathname ? "bg-boc_darkgreen text-white" : "bg-transparent"}`}
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
      <div
        className="flex space-x-5 text-boc_darkbrown py-4 
      text-xl font-bold align-center"
      >
        <NavButton url="/">HOME</NavButton>
        <NavButton url="/about">ABOUT</NavButton>
        <NavButton url="/trips">TRIPS</NavButton>
        <NavButton url="/gear-room">RENTALS</NavButton>
        <NavButton url="/contact">CONTACT</NavButton>
        <SignIn />
      </div>
    </div>
  );
}

export default NavBar; // Make sure to export the component
