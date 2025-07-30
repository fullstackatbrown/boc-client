"use client"

import { TripParticipant, TripStatus, TripWithSignup } from "@/models/models";
import { Requesters } from "@/scripts/requests";
import { AxiosResponse } from "axios";
import { ReactNode, useState, useEffect } from "react";

export default function KeyInfoBar({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  const { backendGet } = reqs;
  const [signups, setSignups] = useState<TripParticipant[]|null>(null);
  useEffect(()=>{
    backendGet(`/trip/${trip.id}/lead/participants`)
      .then((res: AxiosResponse<any,any>) => setSignups(res.data))
      .catch((err) => alert(`ERROR: ${err}`));
  },[])
  const Bar = (text: ReactNode) => <div className="p-4 rounded-lg bg-gray-200 w-full">{text}</div>
  let content;
  switch (trip.status) {
    case TripStatus.Staging || TripStatus.Complete:
      content = <></>;
      break;
    case TripStatus.Open:
      if (signups) {
        content = Bar(<p>
          <span className="font-bold">Signups:&nbsp;</span> 
          {signups.length}  {signups.length < trip.maxSize 
            ? <>❌<span className="text-red-500 italic"> less signups than trip size</span></>
            : <>✅<span className="text-green-500 italic"> more (or equal) signups than trip size</span></>
          }
          </p>);
      }
      break;
    case TripStatus.PreTrip:
      if (signups) {
        console.log(signups)
        const confirmedNum = signups.reduce((accum: number, tp: TripParticipant) => (tp.confirmed ? accum + 1 : accum), 0);
        const pendingNum = signups.length - confirmedNum;
        const paidNum = signups.reduce((accum: number, tp: TripParticipant) => (tp.paid ? accum + 1 : accum), 0);
        content = Bar(<div className="flex gap-3">
            <p><span className="font-bold">Pending:</span>&nbsp;{pendingNum}</p>
            <p><span className="font-bold">Confirmed:</span>&nbsp;{confirmedNum}</p>
            <p><span className="font-bold">Paid:</span>&nbsp;{paidNum}</p>
          </div>);
      }
      break;
    case TripStatus.PostTrip:
      content = <></>;
      break;
  }
  return (content ? content : <></>)
}