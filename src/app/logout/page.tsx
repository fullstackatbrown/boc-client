"use client";
import React, { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

export default function Logout() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="px-20 py-10">
      Go to{" "}
      <u>
        <a href="/">home page</a>
      </u>{" "}
      if not automatically redirected
    </div>
  );
}
