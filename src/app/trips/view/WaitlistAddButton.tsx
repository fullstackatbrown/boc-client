"use client"

import { TripWithSignup } from "@/models/models";
import { Requesters } from "@/scripts/requests";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import HoverButton from "@/components/HoverButton";
import { useState } from "react";

//A side action for the participant dropdown: click to reveal a numeric input, then
//Enter to pull that many people off the waitlist. The server clamps to what is
//actually waitlisted, so a stale count here just promotes fewer than asked.
export default function WaitlistAddButton({ trip, reqs, waitlistCount, onEmpty }:{ trip: TripWithSignup, reqs: Requesters, waitlistCount: number, onEmpty: () => void }) {
  const [open, setOpen] = useState<boolean>(false);
  const [count, setCount] = useState<string>("1");

  function submit() {
    const asked = parseInt(count);
    if (Number.isNaN(asked) || asked < 1) return;
    reqs.backendPost(`/trip/${trip.id}/lead/add-participant`, { count: Math.min(asked, waitlistCount) })
      .then((res) => {
        if (res.data.success) window.location.reload();
        else { setOpen(false); onEmpty(); }
      })
      .catch((err) => alert(`You shouldn't be seeing this! Send this message to a site administrator. ERROR: ${err}`));
  }

  //Nobody to add, so keep the old behavior of just explaining that
  if (waitlistCount == 0) return <HoverButton
    header="Add from Waitlist"
    icon={<UserPlusIcon className="w-5 h-5 text-boc_darkgreen"/>}
    onClick={onEmpty}
  />
  if (!open) return <HoverButton
    header="Add from Waitlist"
    icon={<UserPlusIcon className="w-5 h-5 text-boc_darkgreen"/>}
    onClick={() => setOpen(true)}
  />
  return (
    <div className="flex items-center px-4 py-3 gap-2">
      <input
        type="number"
        min={1}
        max={waitlistCount}
        value={count}
        autoFocus
        className="w-16 px-2 py-1 rounded-lg border border-boc_darkgreen text-boc_darkgreen"
        onChange={(e) => setCount(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") setOpen(false);
        }}
        onBlur={() => setOpen(false)}
      />
      <span className="text-boc_darkgreen font-medium">of {waitlistCount} waitlisted</span>
    </div>
  )
}
