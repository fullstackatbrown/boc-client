"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// import api from "@/scripts/api";
import { useSession } from "next-auth/react";
import { makeRequesters }from "@/scripts/requests";
import { TripWithSignup } from "@/models/models";

import TripPageContents from "./TripPageContents";

export default function TripPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [trip, setTrip] = useState<TripWithSignup|null>(null);
  const [loading, setLoading] = useState(true);

  const { status } = useSession();
  const reqs = makeRequesters();
  const { backendGet } = reqs;

  useEffect(() => {
    if (status !== "loading") {
      backendGet(`/trip/${id}`)
        .then((res): void => {
          setTrip(res.data);
          setLoading(false);
        })
        .catch((err): void => {
          switch (err.status) {
            case (401):
              alert("The requested trip is still in staging. Log in with a trip leader's account or wait for the trip to be made public!")
              break;
            case (404):
              alert("The requested trip page does not exist.")
              break;
            default:
              alert(`ERROR. You shouldn't be seeing this! Contact the website's admin and send them a picture of this message! ${err}`)
              break;
          }
          window.location.href = '/trips'
        })
    }
  }, [status]);

  if (loading) {
    return <div className="px-20 flex justify-center">Loading...</div>;
  } else {
    return <TripPageContents trip={trip!} reqs={reqs}/>
  }
}
