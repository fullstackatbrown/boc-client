"use client";
import React, { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

export default function Logout() {
  useEffect(() => {
    const timer = setTimeout(() => {
      signOut({ callbackUrl: "/" });
    }, 2000); // 2000ms = 2 seconds

    // Clean up the timer if the component unmounts before timeout
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="px-20 py-10">
      Signing out in 2 seconds. {" "}
      <u>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault(); // prevent default anchor navigation
            signOut({ callbackUrl: "/" });
          }}
        >
          Logout manually
        </a>
      </u>{" "}
      if not automatically redirected
    </div>
  );
}
