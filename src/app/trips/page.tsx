"use client";
import NavBar from "@/components/NavBar";
import WhiteWaterBanner from "@/components/WhiteWaterBanner";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/trips`).then((res) => {
      setTrips(res.data);
      setFilteredTrips(res.data);
    });
  }, []);

  // Apply filters whenever filter values change
  useEffect(() => {
    let result = trips;
    
    // Filter by name
    if (nameFilter) {
      result = result.filter(trip => 
        trip.tripName.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    
    // Filter by date (After Date)
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      result = result.filter(trip => {
        const tripDate = new Date(trip.plannedDate);
        return tripDate >= filterDate; // Changed to "after or on" the selected date
      });
    }
    
    // Filter by size (Minimum Size)
    if (sizeFilter) {
      const size = parseInt(sizeFilter);
      if (!isNaN(size)) {
        result = result.filter(trip => trip.maxSize >= size); // Changed to greater than or equal
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
    <div className="h-full min-h-screen w-full overflow-x-hidden">
      <NavBar></NavBar>

      {/* Site content */}
      <WhiteWaterBanner text="TRIPS"></WhiteWaterBanner>
      {/* Title and Description */}
      <section className="p-8">
        <h1 className="text-5xl font-bold text-black">BOC Trips Calendar</h1>
        <hr className="my-4 border-t-2 border-black" />
        <p className="text-black text-xl">
          This is a description about the page.
        </p>

        {/* Upcoming Trips Heading */}
        <h2 className="text-4xl font-bold text-black mt-8">Upcoming Trips</h2>

        {/* Filters */}
        <div className="my-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Filter Trips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Name
              </label>
              <input
                type="text"
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
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reset Filters
          </button>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse border border-black">
            {/* Table Head */}
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black px-4 py-2">Name</th>
                <th className="border border-black px-4 py-2">Date</th>
                <th className="border border-black px-4 py-2">Description</th>
                <th className="border border-black px-4 py-2">Size</th>
                <th className="border border-black px-4 py-2">Leaders</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredTrips.map((trip, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-black px-4 py-2">
                    <a 
                      href={`/trips/view?id=${index + 1}`} 
                      className="text-blue-600 underline"
                    >
                      {trip.tripName}
                    </a>
                  </td>
                  <td className="border border-black px-4 py-2">
                    {new Date(trip.plannedDate).toLocaleDateString()}
                  </td>
                  <td className="border border-black px-4 py-2">{trip.sentenceDesc}</td>
                  <td className="border border-black px-4 py-2">
                    {trip.maxSize}
                  </td>
                  <td className="border border-black px-4 py-2">
                    {trip.class || "Not specified"}
                  </td>
                </tr>
              ))}
              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan={5} className="border border-black px-4 py-2 text-center">
                    No trips match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
