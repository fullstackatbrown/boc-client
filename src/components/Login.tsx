"use client";
import axios from "axios";
import { signIn } from "next-auth/react";

function Login(props: any) {
  return (
    <span onClick={() => signIn("google")} className="cursor-pointer">
      {props.children}
    </span>
  );
}

export default Login;
