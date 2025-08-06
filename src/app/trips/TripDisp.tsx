import { Trip } from "@/models/models"
import Logo from "@/assets/images/header/logo.svg"
import yArrow from "@/assets/images/trips/arrow-yellow.svg"
import gArrow from "@/assets/images/trips/arrow-green.svg"
import { formatDateString } from "@/utils/utils"

export default function TripDisp({ trips }:{ trips: Trip[] }) {
    return (
      <div className="overflow-x-auto mt-2 mb-3 max-h-[36rem] overflow-y-scroll"> {/* 36rem is just enough to see 4 cards, which seems good to me... I'm amenable to changing though */}
        {/* Trip Cards */} 
        <div className="grid grid-cols-1 gap-2">
          {trips.length > 0 ? (
            trips.map((trip, index) => (
              <a key={index} href={`/trips/view?id=${trip.id}`}>
                <div
                  className={`w-[calc(100% - 1.5rem)] pl-4 pt-4 pr-2 pb-2 rounded-[20px] drop-shadow-lg font-standard mx-3 mb-2 flex flex-col h-36
                  shadow-[4px] ${index % 2 == 0 ? "bg-boc_yellow text-black" : "bg-boc_darkgreen text-white"}`}
                >
                  <div className="w-full px-2 flex flex-grow-0" >
                    <img src={Logo.src} className="aspect-square h-12 flex-grow-0"/> {/* Using logo as placeholder icon for now*/}
                    <div className="ml-4 h-12">
                      <h2 className="text-lg mb-0">{trip.tripName}</h2>
                      <p className={`mt-0 text-sm ${index % 2 == 0 ? "text-boc_medbrown" : "text-boc_slate"}`}>
                        Date: {formatDateString(trip.plannedDate)}
                      </p>
                    </div>
                  </div>
                  <p className="mb-1 max-h-[2.5rem] overflow-y-scroll flex-grow">{trip.sentenceDesc}</p>
                  <div className="w-full flex justify-end flex-grow-0">
                    <img src={index % 2 == 0 ? gArrow.src : yArrow.src} className="aspect-square h-8"/>
                  </div>
                </div>
              </a>
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