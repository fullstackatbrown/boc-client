"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";

import Login from "@/components/Login";
import { useLogin } from "@/contexts/LoginContext";

import bear_vector from "@/assets/images/header/logo.svg";

function NavButton(props: { item: any }) {
  const pathname = usePathname();
  const isDropdown = props.item.dropdown.length > 0;

  return (
    <div className="relative group">
      <button
        className={`py-2 px-4 rounded-lg
        ${isDropdown ? "group-hover:rounded-b-none" : ""}
          cursor-pointer font-montserrat font-bold text-[13pt]
          group-hover:bg-boc_green group-hover:text-white
      ${pathname.includes(props.item.url) ? "bg-boc_green text-white" : "bg-transparent text-boc_darkbrown"}`}
        onClick={() => {
          window.location.href = props.item.url;
        }}
      >
        {props.item.label}
      </button>

      {isDropdown ? (
        <ul
          className="absolute top-full w-full bg-background text-[12pt]
      text-boc_darkbrown rounded-b-md opacity-0 invisible border-[2px] border-boc_green
      group-hover:visible group-hover:opacity-100 z-10"
        >
          {props.item.dropdown.map((option, i) => (
            <li
              key={i}
              onClick={() => {
                window.location.href = option.url;
              }}
              className={`px-2 py-2 cursor-pointer hover:bg-green-100 
                border-b-transparent rounded-b-[5px] text-center
              ${i > 0 ? "border-boc_darkgreen border-t-[2px]" : ""}`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function NavBar() {
  const { isLoggedIn, setIsLoggedIn } = useLogin();
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);

  const menuItems = [
    {
      label: "ABOUT",
      url: "/about",
      dropdown: [
        { label: "About Us", url: "/about" },
        { label: "Land Tribute", url: "/about/land-tribute" },
        { label: "Our Team", url: "/about/our-team" },
        { label: "Photo Album", url: "/about/photo-album" },
      ],
    },
    {
      label: "TRIPS",
      url: "/trips",
      dropdown: [],
    },
    {
      label: "GET INVOLVED",
      url: "/get-involved",
      dropdown: [],
    },
    {
      label: "GEARS",
      url: "/gear-room",
      dropdown: [
        { label: "Gear Room", url: "/gear-room" },
        { label: "Policies", url: "/gear-room/policies" },
      ],
    },
  ];

  const userItem = {
    label: user,
    url: "/user",
    dropdown: [
      { label: "Profile", url: "/user" },
      { label: "Logout", url: "/logout" },
    ],
  };

  const updateLogin = async () => {
    try {
      let token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const { data: userData } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/user/profile`,
        {
          headers: {
            token: token,
          },
        },
      );
      setUser(`${userData.firstName} ${userData.lastName}`);
      setLoading(false);
    } catch (error) {
      localStorage.removeItem("access_token");
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    updateLogin();
  }, [isLoggedIn]);

  return (
    <nav className="px-8 py-8 flex justify-between">
      <a href="/">
        <img
          src={bear_vector.src}
          alt="Bear Vector"
          className="cursor-pointer"
        />
      </a>
      <div className="flex space-x-[37px] px-10 py-4">
        {menuItems.map((item, index) => (
          <NavButton key={index} item={item} />
        ))}

        {loading ? (
          <div className="w-[200px]"></div>
        ) : (
          <div className="flex font-bold font-montserrat text-boc_darkbrown justify-end w-[200px]">
            {user ? (
              <NavButton item={userItem} />
            ) : (
              <Login>
                <div className="h-full flex items-center">LOGIN</div>
              </Login>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar; // Make sure to export the component
