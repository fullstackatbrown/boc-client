"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// import api from "@/scripts/api";
import { useSession } from "next-auth/react";
import { makeRequesters }from "@/scripts/requests"

import TripPageContents from "./TripPageContents";

export default function TripPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { status } = useSession();
  const reqs = makeRequesters();
  const { backendGet } = reqs;

  useEffect(() => {
    if (status !== "loading") {
      backendGet(`/trip/${id}`)
        .then((res): void => {
          setTrip(res.data);
          // if (res.data.userData == null) {
          //   // Not signed in
          //   setRole(null);
          // } else if (res.data.userData == -1) {
          //   // Signed in but not signed up
          //   setRole("None");
          // } else {
          //   // Signed in and signed up
          //   setRole(res.data.userData.tripRole);
          //   setSignedUp(true);
          // }
          setLoading(false);
        });
    }
  }, [status]);

  if (loading) {
    return <div className="px-20 flex justify-center">Loading...</div>;
  } else {
    return <TripPageContents trip={trip} reqs={reqs}/>
  }
}
