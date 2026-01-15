'use client';

import BOCButton from "@/components/BOCButton";
import Login from "@/components/Login";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-red-600">Login Failed</h1>
      
      {error === "AccessDenied" && (
        <p className="mt-4 text-gray-700 text-center">
          We restricted access to only <strong>@brown.edu</strong> and <strong>@risd.edu</strong> emails.
          <br/>
          Try again with a student account if you have one or feel free to peruse our site without logging in!
        </p>
      )}
      <div className="mt-6">
        <Login callBack="/">
          <BOCButton text="Try Again" onClick={()=>{}}/>
        </Login>
      </div>
      {/* <a 
        href="/api/auth/signin" 
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try Again
      </a> */}
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    // SearchParams requires Suspense boundary in Next.js App Router
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}