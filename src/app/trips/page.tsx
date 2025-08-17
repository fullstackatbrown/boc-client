"use client";

import Title from "@/components/Title";
import Dropdown from "@/components/Dropdown";
import CreationButton from "./CreationButton";
import TripDisp from "./TripDisp";
import { Trip, Role, TripStatus } from "@/models/models";
import { useEffect, useState, useRef } from "react";
import { makeRequesters } from "@/scripts/requests";

export default function Trips() {
  //Filter utilities
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const fetched = useRef(false);

  // Non-filter resources
  const { backendGet } = makeRequesters();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [currTrips, setCurrTrips] = useState<Trip[]>([]);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const curr: Trip[] = [];
    const past: Trip[] = [];

    filteredTrips.forEach((trip) => {
      if (trip.status === TripStatus.Open) {
        curr.push(trip);
      } else {
        past.push(trip);
      }
    });

    setCurrTrips(curr);
    setPastTrips(past);
  }, [filteredTrips]);

  useEffect(() => {
    //Grab user's role
    backendGet("/user")
      .then((res): void => setUserRole(res.data.role))
      .catch((e): void => {
        console.log(e.status, e.status !== 401);
        if (e.status !== 401) console.error(`Fetching user data failed: ${e}`);
        else setUserRole(Role.None); //If status is 401, user is just not logged in
      });
  }, []);

  useEffect(() => {
    if (fetched.current) {
      return;
    }
    fetched.current = true;

    backendGet("/trips", true)
      .then((res): void => {
        //Tie date objects to each trip, sort them by date, and initially set both trips and filtered Trips
        let trips = res.data;
        // trips.forEach((trip: Trip) => { trip.date = new Date(trip.plannedDate) })
        // trips.sort((trip1: Trip, trip2: Trip) => { return trip1.date!.getTime() - trip2.date!.getTime() })
        setTrips(trips);
        setFilteredTrips(trips);
        //Determine the idx in the trips list splitting current and past trips
        // setSplitIdx(findSplit(trips))
      })
      .catch((e): void => console.error("Fetching trips failed: " + e));
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
    //setSplitIdx(findSplit(result))
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
  );

  return (
    <div className="relative w-full pb-10 px-20">
      {/* Title and Description */}
      <Title text="BOC Trips Calendar" />
      Find all of our upcoming trips on this page and click on them to learn
      more!
      <section className="pt-5">
        {/* Filters */}
        <Dropdown header="Filters" content={filterEl} />
        <div className="mx-4 mb-4">
          <h2 className="font-funky text-2xl text-boc_medbrown">
            Upcoming Trips!
          </h2>
        </div>
        <TripDisp trips={currTrips} />
        <Dropdown
          header="Past/Closed Trips"
          content={<TripDisp trips={pastTrips} />}
        />
      </section>
      {userRole && [Role.Leader, Role.Admin].includes(userRole) ? ( //Display trip creation button if user is a leader/admin
        <div>
          <CreationButton footerRef={sentinelRef} />
          <div
            ref={sentinelRef}
            className="w-full absolute bottom-0"
          ></div>{" "}
          {/* Sentinel for positioning the creation button */}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
