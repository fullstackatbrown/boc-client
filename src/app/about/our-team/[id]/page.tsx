"use client";
import React, { use, useEffect, useState } from "react";
import { makeRequesters } from "@/scripts/requests";
import db from "@/scripts/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { formatDateString } from "@/utils/utils";

// Assets imported from your original structure
import tripsBadge from "@/assets/images/profile/badge.png";

export default function LeaderProfile({ params }: { params: Promise<{ id: string }> }) {
  // 1. Unwrap params for Next.js 15
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { backendGet } = makeRequesters();
  const [leader, setLeader] = useState<any>(null);
  const [tripCount, setTripCount] = useState(0);
  const [pastTrips, setPastTrips] = useState<any[]>([]);

  useEffect(() => {
    const fetchPageData = async () => {
      // 2. Retrieve static leader data from Firestore
      const leaderSnap = await getDoc(doc(db, "team", id));
      if (leaderSnap.exists()) {
        const data = leaderSnap.data();
        setLeader(data);

        const nameParts = data.name.split(" ");
        const first = nameParts[0];
        const last = nameParts.slice(1).join(" ");

        try {
          // 3. Retrieve relational stats and trip history from MySQL
          const [statsRes, tripsRes] = await Promise.all([
            backendGet(`/public/leader-stats/${first}/${last}`),
            backendGet(`/public/leader-trips/${first}/${last}`)
          ]);
          
          setTripCount(statsRes.data.totalTrips);
          // Separate past trips using existing date logic
          setPastTrips(tripsRes.data.filter((t: any) => new Date(t.date) < new Date()));
        } catch (err) {
          console.error("SQL fetch failed", err);
        }
      }
    };
    fetchPageData();
  }, [id, backendGet]);

  if (!leader) return <div className="p-10 text-center font-funky text-boc_darkbrown text-2xl">Loading...</div>;

  return (
    /* Main container with pb-16 for a balanced bottom gap */
    <main className="px-10 pt-8 pb-24 md:px-20">
      
      {/* Large Navigation Arrow */}
      <div className="mb-8">
        <Link 
          href="/about/our-team" 
          className="flex items-center gap-3 text-boc_darkbrown hover:opacity-70 transition-all transform hover:-translate-x-1 font-bold text-xl"
        >
          <span className="text-3xl">←</span> Back to Our Team
        </Link>
      </div>

      {/* Header Grid: Mathematically centered name */}
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr_250px] items-center gap-8 border-b-2 border-boc_darkbrown pb-8">
        
        {/* Profile Photo: Single Frame */}
        <div className="flex justify-start">
          <div className="border-[6px] border-[#d2b48c] shadow-md overflow-hidden bg-white w-56 h-56 shrink-0">
            <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Name & Title: All Brown Theme */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-6xl font-funky text-boc_darkbrown leading-[1.1]">
            <b>{leader.name}</b>
          </h1>
          <p className="text-2xl text-boc_darkbrown italic mt-1 opacity-80">{leader.position}</p>
        </div>

        {/* Trips Badge */}
        <div className="flex justify-end">
          <div className="w-48 text-center shrink-0">
            <p className="text-xl font-bold text-boc_darkbrown uppercase tracking-widest leading-none mb-1">
              Summit Seeker
            </p>
            <div className="relative w-full aspect-square flex items-center justify-center">
              <img src={tripsBadge.src} alt="badge" className="absolute inset-0 w-full h-full object-contain" />
              <span className="relative z-10 text-white font-bold text-5xl pt-1">
                {tripCount}
              </span>
            </div>
            <p className="text-xl font-bold text-boc_darkbrown uppercase tracking-widest leading-none mt-1">
              Total Trips
            </p>
          </div>
        </div>
      </div>

      {/* About Section: Full width text */}
      <div className="mt-8 w-full">
        <h2 className="text-3xl font-bold text-boc_darkbrown mb-3 font-funky">
          About
        </h2>
        <p className="text-xl leading-relaxed text-gray-800">
          {leader.bio || "This leader hasn't added a bio yet."}
        </p>
      </div>

      {/* Past Trips Table: Card-row style */}
      <div className="mt-12 w-full">
        <h2 className="text-3xl font-bold text-boc_darkbrown mb-6 font-funky border-b-2 border-boc_darkbrown pb-2">
          Past Trips
        </h2>
        
        {pastTrips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-boc_darkbrown text-lg font-bold">
                  <th className="px-4 pb-2">Trip Name</th>
                  <th className="px-4 pb-2 text-center">Date</th>
                </tr>
              </thead>
              <tbody>
                {pastTrips.map((trip) => (
                  <tr 
                    key={trip.tripId} 
                    className="group hover:scale-[1.01] transition-transform cursor-pointer"
                    onClick={() => window.location.href = `/trips/view?id=${trip.tripId}`}
                  >
                    <td className="p-5 rounded-l-xl border-y-2 border-l-2 border-boc_darkbrown bg-white/40 group-hover:bg-white transition-colors">
                      <p className="font-bold text-2xl text-boc_darkbrown">{trip.tripName}</p>
                      <p className="text-gray-600 line-clamp-1 mt-1">{trip.sentenceDesc}</p>
                    </td>
                    <td className="p-5 rounded-r-xl border-y-2 border-r-2 border-boc_darkbrown bg-white/40 group-hover:bg-white transition-colors text-center font-bold text-2xl text-boc_darkbrown">
                      {formatDateString(trip.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xl text-boc_darkbrown italic border-2 border-dashed border-boc_darkbrown rounded-xl p-10 text-center opacity-60">
            No past trips recorded yet!
          </p>
        )}
      </div>
    </main>
  );
}