"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import { useSession } from "next-auth/react";
import { AuthStat, makeRequesters }from "@/scripts/requests";
import { TripWithSignup } from "@/models/models";

import TripPageContents from "./TripPageContents";

export default function TripPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [trip, setTrip] = useState<TripWithSignup|null>(null);

  const reqs = makeRequesters();
  const { backendGet, sessionStatus } = reqs;

  useEffect(() => {
    sessionStatus().then((stat: AuthStat) => {
      let noAuth = (stat == AuthStat.Unauth);
      backendGet(`/trip/${id}`, noAuth)
        .then((res): void => { setTrip(res.data); })
        .catch((err): void => {
          console.log("ERRORED!!")
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
    }).catch((err) => { alert(err) })
  }, []);

  if (!trip) {
    return <div className="px-20 flex justify-center">Loading...</div>;
  } else {
    return <TripPageContents trip={trip!} reqs={reqs}/>
  }
}
