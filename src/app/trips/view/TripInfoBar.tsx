'use client'

import { TripWithSignup, SimpleUser } from "@/models/models";
import pizzaAlan from "@/assets/images/trips/pizza-alan.jpeg"
import SignupButton from "./SignupButton";
import { Requesters } from "@/scripts/requests";
import { useRef, useState, useEffect } from "react";

function classToCost(cls: string): number | undefined {
  const mapping: Record<string, number> = { //Thanks Chat
    A: 5,
    B: 10,
    C: 15,
    D: 20,
    E: 25,
    F: 30,
    G: 35,
    H: 40,
    I: 45,
    J: 50,
    Z: 0
  };
  return mapping[cls];
}

function TripInfo({ lead, text }:{ lead: string, text: string }) {
  return (
    <div className="mb-1">
      <p><span className="font-bold mr-2">{lead}:</span>{text}</p>
    </div>
  )
}

export default function TripInfoBar({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  //Annoying stuff to properly set the height the image
  const infoRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (infoRef.current && imageRef.current) {
      const infoHeight = infoRef.current.offsetHeight;
      setHeight(infoHeight);
    }
  }, [trip, infoRef]);
  
  const cost = (trip.class ? classToCost(trip.class) : trip.priceOverride! )
  return (
    <div className="w-full pt-4">
      <div className="flex flex-row gap-x-4">
        {/* Image wrapper with dynamic height */}
        <div ref={imageRef} style={{ height }} className="w-80 flex-shrink-0">
          <img
            src={pizzaAlan.src}
            className="w-full h-full object-cover rounded-2xl"
            style={{ objectPosition: 'center' }}
          />
        </div>

        {/* Info panel with dynamic height reference */}
        <div ref={infoRef} className="flex-grow flex flex-col gap-4">
          <div className="w-full bg-boc_lightgreen rounded-2xl pt-4 pb-8 px-10">
            <h2 className="w-full text-center text-boc_green font-funky text-3xl mb-3">Trip Info</h2>
            <div className="flex justify-around flex-col">
              <TripInfo lead="Leaders" text={trip.leaders.map((leader: SimpleUser) => `${leader.firstName} ${leader.lastName}`).join(", ") || "No leaders assigned"} />
              <TripInfo lead="Trip Category" text={trip.category || "Not specified"} />
              <TripInfo lead="Date" text={trip.plannedDate ? new Date(trip.plannedDate).toLocaleDateString() : "Date not set"} />
              <TripInfo lead="Cost" text={cost === 0 ? "Free!" : "$" + String(cost)} />
            </div>
          </div>
          <SignupButton trip={trip} reqs={reqs} />
        </div>
      </div>
      {/* <div className="flex flex-row items-stretch gap-x-4">
        <div className="w-96 flex-shrink-0 flex flex-col h-full">
          <div className="flex-grow">
            <img
              src={pizzaAlan.src}
              className="w-full h-full object-cover rounded-2xl"
              style={{ objectPosition: 'center' }}
            />
          </div>
        </div>
        <div className="flex-grow flex flex-col gap-4">
          <div className="w-full bg-boc_lightgreen rounded-2xl pt-4 pb-8 px-10">
            <h2 className="w-full text-center text-boc_green font-funky text-3xl mb-3">Trip Info</h2>
            <div className="flex justify-around flex-col">
              <TripInfo lead="Leaders" text={trip.leaders.map((leader: SimpleUser) => `${leader.firstName} ${leader.lastName}`).join(", ") || "No leaders assigned"} />
              <TripInfo lead="Trip Category" text={trip.category || "Not specified"}/>
              <TripInfo lead="Date" text={trip.plannedDate ? new Date(trip.plannedDate).toLocaleDateString() : "Date not set"}/>
              <TripInfo lead="Cost" text={cost == 0 ? "Free!" : "$"+String(cost)} />
            </div>
          </div>
          <SignupButton trip={trip} reqs={reqs}/>
        </div>
      </div> */}
      {/* <p className="text-[2vmin] pt-4 pb-4">{trip.sentenceDesc}</p> */}
    </div>
  )
}