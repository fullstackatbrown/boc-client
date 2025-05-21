"use client";
import React, { useEffect, useRef, useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

import login from "@/scripts/login";
import bear_vector from "@/assets/images/logo.svg";
import { usePathname } from "next/navigation";

const handleLoginSuccess = async (response: { code: string }) => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/auth`,
      {
        code: response.code,
      },
    );
    localStorage.setItem("access_token", data.access_token);
  } catch (error) {
    console.error("Error during authentication", error);
  }
};

const handleLoginFailure = (error: unknown) => {
  console.error("Login failed", error);
};

const menuItems = [
  {
    label: "ABOUT",
    url: "/about",
    dropdown: [
      { label: "About Us", url: "/about" },
      { label: "Land Tribute", url: "/about/land-tribute" },
    ],
  },
  {
    label: "TRIPS",
    url: "/trips",
    dropdown: [],
  },
  {
    label: "GEAR",
    url: "/gear-room",
    dropdown: [
      { label: "Gear Room", url: "/gear-room" },
      { label: "Policies", url: "/gear-room/policies" },
    ],
  },
  {
    label: "GET INVOLVED",
    url: "/get-involved",
    dropdown: [],
  },
];

function NavButton(props: { item: any }) {
  const pathname = usePathname();
  const isDropdown = props.item.dropdown.length > 0;

  return (
    <div className="relative group min-w-[150px]">
      <button
        className={`w-full h-full py-2 px-4 rounded-lg 
        ${isDropdown ? "group-hover:rounded-b-none" : ""}
          cursor-pointer font-montserrat font-bold
      ${pathname == props.item.url ? "bg-boc_green text-white" : "bg-transparent text-boc_darkbrown"}`}
        onClick={() => {
          window.location.href = props.item.url;
        }}
      >
        {props.item.label}
      </button>

      {isDropdown ? (
        <ul
          className="absolute top-full w-full bg-transparent text-[12pt]
      text-boc_darkbrown rounded-b-md opacity-0 invisible border-[2px] border-boc_green
      group-hover:visible group-hover:opacity-100 z-10"
        >
          {props.item.dropdown.map((option, i) => (
            <li
              key={i}
              onClick={() => {
                window.location.href = option.url;
              }}
              className={`px-2 py-2 cursor-pointer
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
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);

  const updateLogin = async () => {
    try {
      let token = localStorage.getItem("access_token");
      if (!token) {
        setUser("");
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
      setUser("");
      setLoading(false);
    }
  };

  useEffect(() => {
    updateLogin();
  }, []);

  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: handleLoginFailure,
    flow: "auth-code",
  });

  const userItem = {
    label: user,
    url: "/user",
    dropdown: [
      { label: "Profile", url: "/user" },
      { label: "Logout", url: "/logout" },
    ],
  };

  return (
    <nav className="px-8 py-4 flex justify-between">
      <a href="/">
        <img
          src={bear_vector.src}
          alt="Bear Vector"
          className="cursor-pointer absolute"
        />
      </a>
      {loading ? (
        <div className="min-w-[200px] min-h-[80px]"></div>
      ) : (
        <div className="flex space-x-10 py-4 min-h-[80px]">
          {menuItems.map((item, index) => (
            <NavButton key={index} item={item} />
          ))}

          <div className="min-w-[200px]">
            {user ? (
              <NavButton item={userItem} />
            ) : (
              <button
                onClick={() => {
                  login();
                }}
                className="font-bold font-montserrat text-boc_darkbrown"
              >
                LOGIN
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

async function logout() {
  localStorage.removeItem("access_token");
  window.location.href = "/";
}

export default NavBar; // Make sure to export the component
