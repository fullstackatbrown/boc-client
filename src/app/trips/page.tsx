"use client";
import Title from "@/components/Title";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);

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

    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE}/trips`, {
        headers: {
          token: localStorage.getItem("access_token"),
        },
      })
      .then((res) => {
        setTrips(res.data);
        setFilteredTrips(res.data);
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
  }, [nameFilter, dateFilter, sizeFilter, trips]);

  // Reset all filters
  const resetFilters = () => {
    setNameFilter("");
    setDateFilter("");
    setSizeFilter("");
  };

  return (
    <div className="h-full w-full py-10 px-20">
      {/* Title and Description */}
      <Title text="BOC Trips Calendar" />
      Find all of our upcoming trips on this page and click on them to learn
      more!
      <section className="pt-10">
        {/* Filters */}
        <div className="rounded-lg">
          <h3 className="text-2xl font-semibold mb-3">Filter Trips</h3>
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

        <div className="overflow-x-auto mt-6">
          {/* Trip Cards */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip, index) => (
                <a key={index} href={`/trips/view?id=${index + 1}`}>
                  <div
                    className={`w-full p-4 rounded-[20px] 
                    shadow-[4px] ${index % 2 == 0 ? "bg-boc_yellow text-black" : "bg-boc_darkgreen text-white"}`}
                  >
                    <h2 className="text-lg font-bold mb-0">{trip.tripName}</h2>
                    <p className="mb-1">
                      {new Date(trip.plannedDate).toLocaleDateString()}
                    </p>
                    <p className="mb-1">{trip.sentenceDesc}</p>
                  </div>
                </a>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-600">
                No trips match your filters
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
