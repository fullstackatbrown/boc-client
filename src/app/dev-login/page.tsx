"use client";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import BOCButton from "@/components/BOCButton";

//
// TEST IDENTITY BYPASS - DEVELOPMENT ONLY
//
// A front door for the `e2e` Credentials provider (see api/auth/[...nextauth]/route.ts),
// so that manual testing can act as any user without a real Google login. Playwright
// drives that provider directly; this page is the human equivalent.
//
// SAFETY: gated on the same flag as the provider itself. NEXT_PUBLIC_E2E is inlined at
// build time, so with the flag unset this page renders nothing usable and the provider
// it targets is not registered - signing in here would fail even if it did render.
//
const E2E_AUTH_ENABLED = process.env.NEXT_PUBLIC_E2E === "1";

//Seeded by boc-server/default_insts.mjs. The two test@du.de accounts are omitted
//deliberately: the domain check rejects anything outside brown.edu / risd.edu.
const SEEDED = [
  { email: "william_l_stone@brown.edu", label: "William Stone", role: "Admin" },
  { email: "alan_wang2@brown.edu", label: "Alan Wang", role: "Admin" },
  { email: "radia.perlman@brown.edu", label: "Radia Perlman", role: "Leader" },
  { email: "ada.lovelace@brown.edu", label: "Ada Lovelace", role: "Participant" },
  { email: "grace.hopper@brown.edu", label: "Grace Hopper", role: "Participant" },
  { email: "alan.turing@brown.edu", label: "Alan Turing", role: "Participant" },
  { email: "katherine.johnson@brown.edu", label: "Katherine Johnson", role: "Participant" },
  { email: "barbara.liskov@brown.edu", label: "Barbara Liskov", role: "Participant" },
  { email: "donald.knuth@brown.edu", label: "Donald Knuth", role: "Participant" },
  { email: "margaret.hamilton@risd.edu", label: "Margaret Hamilton", role: "On no trips" },
];

export default function DevLogin() {
  const { data: session } = useSession();
  const [custom, setCustom] = useState("");

  if (!E2E_AUTH_ENABLED) {
    return (
      <div className="px-6 sm:px-10 desktop:px-20 py-10">
        Test logins are disabled. Restart the dev server with{" "}
        <code className="bg-gray-200 px-1 rounded">NEXT_PUBLIC_E2E=1 npm run dev</code>.
      </div>
    );
  }

  //callbackUrl returns here rather than home, so you can switch users repeatedly
  const become = (email: string) => signIn("e2e", { email, callbackUrl: "/dev-login" });

  return (
    <div className="px-6 sm:px-10 desktop:px-20 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Test Login</h1>
        <p className="text-gray-600">
          Development only. Signs in without Google; the backend accepts the resulting
          session while <code>DEVELOPING</code> is set.
        </p>
      </div>

      <div>
        Currently signed in as:{" "}
        <b>{session?.user?.email ?? "nobody"}</b>
        {session && (
          <span className="ml-4">
            <u className="cursor-pointer" onClick={() => signOut({ callbackUrl: "/dev-login" })}>
              sign out
            </u>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {SEEDED.map((user) => (
          <div key={user.email} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <div className="w-full sm:w-56">
              <BOCButton text={user.label} onClick={() => become(user.email)} grow />
            </div>
            <span className="text-gray-600 break-all sm:break-normal">
              {user.role} - {user.email}
            </span>
          </div>
        ))}
      </div>

      <form
        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) become(custom.trim());
        }}
      >
        <input
          className="border rounded-lg px-4 h-12 w-full sm:w-96"
          placeholder="anyone@brown.edu"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <BOCButton text="Sign In" onClick={() => custom.trim() && become(custom.trim())} />
        <span className="text-gray-600">
          Any unseen brown.edu / risd.edu address is created on first request.
        </span>
      </form>
    </div>
  );
}
