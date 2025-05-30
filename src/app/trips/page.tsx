"use client";
import Title from "@/components/Title";
import Dropdown from "@/components/Dropdown";
import { useEffect, useState, useRef } from "react";
//import axios from "axios";
import makeRequesters from "@/scripts/requests";
import Logo from "@/assets/images/header/logo.svg"
import yArrow from "@/assets/images/trips/arrow-yellow.svg"
import gArrow from "@/assets/images/trips/arrow-green.svg"

interface Trip { //interfaces should prob be made for all backend models and put in some file
  //Backend fields
  id: number,
  tripName: string, 
  plannedDate: string,
  maxSize: number,
  class: string | null,
  priceOverride: number | null, 
  sentenceDesc: string | null, 
  blurb: string | null, 
  status: string,
  planningChecklist: string
  //Fields for Frontend convenience
  date: Date | null
}

function TripDisp({ trips }:{ trips: Trip[] }) {
  return (
    <div className="overflow-x-auto mt-2 mb-3 max-h-[36rem] overflow-y-scroll"> {/* 36rem is just enough to see 4 cards, which seems good to me... I'm amenable to changing though */}
      {/* Trip Cards */} 
      <div className="grid grid-cols-1 gap-2">
        {trips.length > 0 ? (
          trips.map((trip, index) => (
            <a key={index} href={`/trips/view?id=${index + 1}`}>
              <div
                className={`w-[calc(100% - 1.5rem)] pl-4 pt-4 pr-2 pb-2 rounded-[20px] drop-shadow-lg font-standard mx-3 mb-2 flex flex-col h-36
                shadow-[4px] ${index % 2 == 0 ? "bg-boc_yellow text-black" : "bg-boc_darkgreen text-white"}`}
              >
                <div className="w-full px-2 flex flex-grow-0" >
                  <img src={Logo.src} className="aspect-square h-12 flex-grow-0"/> {/* Using logo as placeholder icon for now*/}
                  <div className="ml-4 h-12">
                    <h2 className="text-lg mb-0">{trip.tripName}</h2>
                    <p className={`mt-0 text-sm ${index % 2 == 0 ? "text-boc_medbrown" : "text-boc_slate"}`}>
                      Date: {new Date(trip.plannedDate).toLocaleString('default', { month: 'long', day: 'numeric' })}
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

function findSplit(trips: Trip[]): number {
  const now = new Date();
  for (let [idx, trip] of trips.entries()) { 
    console.log(trip)
    if (trip.date!.getTime() > now.getTime()) { 
      return idx;
    }
  }
  return trips.length
}

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [splitIdx, setSplitIdx] = useState<number>(0);
  const { backendGet } = makeRequesters();

  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) {
      return;
    }
    fetched.current = true;

    backendGet("/trips")
      .then((res): void => {
        //Tie date objects to each trip, sort them by date, and initially set both trips and filtered Trips
        let trips = res.data;
        trips.forEach((trip: Trip) => { trip.date = new Date(trip.plannedDate) })
        trips.sort((trip1: Trip, trip2: Trip) => { return trip1.date!.getTime() - trip2.date!.getTime() })
        setTrips(trips);
        setFilteredTrips(trips);
        //Determine the idx in the trips list splitting current and past trips
        setSplitIdx(findSplit(trips))
      }).catch((e): void => {
        console.log("Get failed: "+e)
      });
  }, []);

  // Apply filters whenever filter values change
  useEffect(() => {
    let result = trips;

    // Filter by name
    if (nameFilter) {
      result = result.filter((trip) =>
        trip.tripName.toLowerCase().includes(nameFilter.toLowerCase()),
      );
    }

    // Filter by date (After Date)
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      result = result.filter((trip) => {
        const tripDate = new Date(trip.plannedDate);
        return tripDate >= filterDate; // Changed to "after or on" the selected date
      });
    }

    // Filter by size (Minimum Size)
    if (sizeFilter) {
      const size = parseInt(sizeFilter);
      if (!isNaN(size)) {
        result = result.filter((trip) => trip.maxSize >= size); // Changed to greater than or equal
      }
    }

    setFilteredTrips(result);
    setSplitIdx(findSplit(result))
  }, [nameFilter, dateFilter, sizeFilter, trips]);

  // Reset all filters
  const resetFilters = () => {
    setNameFilter("");
    setDateFilter("");
    setSizeFilter("");
  };

  const filterEl = (
    <div className="rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trip Name
          </label>
          <input
            type="text-3xl"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Search by name"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            After Date
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Size
          </label>
          <input
            type="number"
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            placeholder="Minimum trip size"
            min="1"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <button
        onClick={resetFilters}
        className="mt-4 px-4 py-2 bg-boc_green text-white rounded hover:bg-boc_darkgreen"
      >
        Reset Filters
      </button>
    </div>
  )

  return (
    <div className="h-full w-full pb-10 px-20">
      {/* Title and Description */}
      <Title text="BOC Trips Calendar" />
      Find all of our upcoming trips on this page and click on them to learn
      more!
      <section className="pt-5">
        {/* Filters */}
        <Dropdown header="Filters" content={filterEl}/>
        <div className="mx-4 mb-4">
          <h2 className="font-funky text-2xl text-boc_medbrown" >Upcoming Trips!</h2>
          <hr className="bg-boc_green border-0 h-[2px] my-3" />
        </div>
        <TripDisp trips={filteredTrips.slice(splitIdx)}/>
        <Dropdown header="Past Trips" content={<TripDisp trips={filteredTrips.slice(0, splitIdx)} />}/>
        
      </section>
    </div>
  );
}
