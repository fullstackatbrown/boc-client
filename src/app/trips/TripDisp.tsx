"use client";

import { Trip } from "@/models/models"
// Note: Logo import removed as it is replaced by dynamic TripIcon
import yArrow from "@/assets/images/trips/arrow-yellow.svg"
import gArrow from "@/assets/images/trips/arrow-green.svg"
import { formatDateString } from "@/utils/utils"
// CHANGE: Imported the new dynamic TripIcon component
import TripIcon from "@/components/TripIcon"
import Link from "next/link"

export default function TripDisp({ trips }:{ trips: Trip[] }) {
    return (
      /* 36rem is just enough to see 4 cards, which seems good to me... I'm amenable to changing though.
         Below desktop the cap is dropped entirely - a 36rem scroll box inside a phone's own scroll
         traps touch scrolling, so the list just flows and the page scrolls. */
      <div className="overflow-x-auto mt-2 mb-3 desktop:max-h-[36rem] desktop:overflow-y-scroll">
        {/* Trip Cards */} 
        <div className="grid grid-cols-1 gap-2">
          {trips.length > 0 ? (
            trips.map((trip, index) => (
              <Link key={trip.id} href={`/trips/view?id=${trip.id}`}>
                {/* Below desktop the card grows to its content: a wrapped trip name overflows a
                    fixed h-36 and collides with the description. */}
                <div
                  className={`w-[calc(100% - 1.5rem)] pl-4 pt-4 pr-2 pb-2 rounded-[20px] drop-shadow-lg font-standard mx-1 sm:mx-3 mb-2 flex flex-col desktop:h-36
                  shadow-[4px] ${index % 2 == 0 ? "bg-boc_yellow text-black" : "bg-boc_darkgreen text-white"}`}
                >
                  <div className="w-full px-2 flex flex-grow-0" >
                    {/* CHANGE: Replaced static Logo <img> with dynamic <TripIcon />.
                      - items-center added to parent div to ensure vertical alignment.
                      - size={44} matches the visual weight of previous h-12 img.
                      - className logic ensures readability on both yellow and green cards.
                    */}
                    <div className="flex items-center justify-center h-12 flex-grow-0">
                      <TripIcon 
                        type={trip.category} 
                        size={44} 
                        weight="duotone"
                        className={index % 2 == 0 ? "text-boc_medbrown" : "text-white"}
                      />
                    </div>
                    
                    {/* h-12 only from desktop - on phones the name wraps and needs the room */}
                    <div className="ml-4 desktop:h-12">
                      <h2 className="text-base sm:text-lg mb-0">{trip.tripName}</h2>
                      <p className={`mt-0 text-sm ${index % 2 == 0 ? "text-boc_medbrown" : "text-boc_slate"}`}>
                        Date: {formatDateString(trip.plannedDate)}
                      </p>
                    </div>
                  </div>
                  {/* Phones clamp to 3 whole lines; desktop keeps its 2.5rem scroll box */}
                  <p className="mb-1 line-clamp-3 desktop:line-clamp-none desktop:max-h-[2.5rem] desktop:overflow-y-scroll flex-grow">{trip.sentenceDesc}</p>
                  <div className="w-full flex justify-end flex-grow-0">
                    {/* decorative: the whole card is a link already labelled by the trip name */}
                    <img src={index % 2 == 0 ? gArrow.src : yArrow.src} alt="" className="aspect-square h-8"/>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600">
              No available trips match your filters!
            </p>
          )}
        </div>
      </div>
    )
}