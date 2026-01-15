"use client";
import axios from "axios";
import { signIn } from "next-auth/react";
import { ReactNode } from "react";

function Login({children, callBack}: {children: ReactNode, callBack?: string}) {
  const options =  callBack? { callbackUrl: callBack } : {};
  return (
    <span onClick={() => signIn("google", options)} className="cursor-pointer">
      {children}
    </span>
  );
}

export default Login;
