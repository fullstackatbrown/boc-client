"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import { useSession } from "next-auth/react";
import { AuthStat, useRequesters } from "@/scripts/requests";
import { TripWithSignup } from "@/models/models";

import { Suspense } from "react";

import TripPageContents from "./TripPageContents";

function TripPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [trip, setTrip] = useState<TripWithSignup | null>(null);

  const reqs = useRequesters();
  const { backendGet, sessionStatus } = reqs;

  useEffect(() => {
    sessionStatus()
      .then((stat: AuthStat) => {
        let noAuth = stat == AuthStat.Unauth;
        backendGet(`/trip/${id}`, noAuth)
          .then((res): void => {
            setTrip(res.data);
          })
          .catch((err): void => {
            console.log("ERRORED!!");
            switch (err.status) {
              case 401:
                alert(
                  "The requested trip is still in staging. Log in with a trip leader's account or wait for the trip to be made public!",
                );
                break;
              case 404:
                alert("The requested trip page does not exist.");
                break;
              default:
                alert(
                  `ERROR. You shouldn't be seeing this! Contact the website's admin and send them a picture of this message! ${err}`,
                );
                break;
            }
            router.push("/trips");
          });
      })
      .catch((err) => {
        alert(err);
      });
    //The requester functions are stable (see useRequesters), so this refetches when the
    //trip id changes or the session resolves - not on every render
  }, [id, sessionStatus, backendGet, router]);

  if (!trip) {
    return <div className="px-20 flex justify-center">Loading...</div>;
  } else {
    return <TripPageContents trip={trip} reqs={reqs} />;
  }
}

export default function TripsWrapper() {
  return (
    <Suspense
      fallback={<div className="px-20 flex justify-center">Loading...</div>}
    >
      <TripPage />
    </Suspense>
  );
}
