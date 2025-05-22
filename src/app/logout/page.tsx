"use client";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

async function logout() {
  localStorage.removeItem("access_token");
  window.location.href = "/";
}

export default function Logout() {
  logout();
  // window.location.href = "/";
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
