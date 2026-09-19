"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { AuthStat, Requesters } from "@/scripts/requests";

/**
 * Tells a signed-out visitor why the trip page shows them no signup controls.
 *
 * Exists because of the 2026-09-17 Apple Picking lottery: students followed the email
 * link from their phone's mail app, landed here without a session, saw "Signups have
 * closed" where the Confirm button should have been, and wrote in to say the site was
 * broken. Decided by the page's own sessionStatus so it always agrees with the header.
 */
export default function SignedOutNotice({ reqs }: { reqs: Requesters }) {
  const [signedOut, setSignedOut] = useState(false);
  useEffect(() => {
    reqs.sessionStatus().then((stat) => setSignedOut(stat === AuthStat.Unauth));
  }, [reqs]);
  if (!signedOut) return null;

  const link = "underline font-bold cursor-pointer";
  return (
    <div className="p-4 mb-4 rounded-lg bg-boc_lightbrown text-boc_darkbrown">
      <p>
        <b>You're not signed in.</b> You need to be signed in to sign up for this trip or to
        see and manage your signup. To sign in, use the LOGIN button{" "}
        {/*The header's login lives in the top-right corner on desktop and inside the hamburger menu below it*/}
        <span className="hidden desktop:inline">at the top right of the page</span>
        <span className="desktop:hidden">in the menu at the top right of the page</span>, visit{" "}
        <a href="/user" className={link}>your profile page</a>, or{" "}
        <span className={link} onClick={() => signIn("google", { callbackUrl: window.location.href })}>
          sign in right here
        </span>
        . You'll come straight back to this trip.
      </p>
    </div>
  );
}
