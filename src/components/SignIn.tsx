"use client";
import React, { useEffect, useRef, useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Link from "next/link";

const Dropdown = (props: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  return (
    <div
      ref={dropdownRef}
      className="relative flex align-center justify-end w-[10em] z-20"
    >
      <button onClick={toggleDropdown}>{props.text} ≡</button>
      {isOpen && (
        <ul className="dropdown-menu absolute top-[100%] right-0">
          <li className="text-right">
            <button onClick={handleViewProfile}>View Profile</button>
          </li>
          <li className="text-right">
            <button onClick={logout}>Logout</button>
          </li>
        </ul>
      )}
    </div>
  );
};

async function logout() {
  localStorage.removeItem("access_token");
  window.location.href = "/";
}

export default function GoogleSignIn() {
  const [user, setUser] = useState("");

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
    } catch (error) {
      setUser("");
    }
  };

  useEffect(() => {
    updateLogin();
  }, []);

  const handleLoginSuccess = async (response: { code: string }) => {
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth`,
        {
          code: response.code,
        },
      );
      localStorage.setItem("access_token", data.access_token);

      updateLogin();
    } catch (error) {
      console.error("Error during authentication", error);
    }
  };

  const handleLoginFailure = (error: unknown) => {
    console.error("Login failed", error);
  };

  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: handleLoginFailure,
    flow: "auth-code",
  });

  return (
    <div className="flex align-center justify-end px-4 w-[15em] font-montserrat font-bold text-boc_darkbrown">
      {user ? (
        <Dropdown text={user} />
      ) : (
        <button
          onClick={() => {
            login();
          }}
        >
          LOGIN
        </button>
      )}
    </div>
  );
}

const handleViewProfile = () => {
  window.location.href = "/user";
};
