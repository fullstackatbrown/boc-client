"use client";
import NavBar from "@/components/NavBar";
import WhiteWaterBanner from "@/components/WhiteWaterBanner";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Trips() {

  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/trips`).then((res) => {
      setTrips(res.data);
    });
  }, []);

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

        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse border border-black">
            {/* Table Head */}
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black px-4 py-2">Name</th>
                <th className="border border-black px-4 py-2">Date</th>
                <th className="border border-black px-4 py-2">Description</th>
                <th className="border border-black px-4 py-2">Date</th>
                <th className="border border-black px-4 py-2">Leaders</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {trips.map((trip, index) => (
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
                    {new Date(trip.plannedDate).toLocaleDateString()}
                  </td>
                  <td className="border border-black px-4 py-2">
                    {trip.class || "Not specified"}
                  </td>
                </tr>
              ))}
              {trips.length === 0 && (
                <tr>
                  <td colSpan={5} className="border border-black px-4 py-2 text-center">
                    No upcoming trips available
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
