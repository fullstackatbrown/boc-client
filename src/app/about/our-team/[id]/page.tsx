"use client";
import React, { use, useEffect, useState } from "react";
import { useRequesters } from "@/scripts/requests";
import db from "@/scripts/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateString } from "@/utils/utils";

// Assets imported from your original structure
import tripsBadge from "@/assets/images/profile/badge.png";
import photoPlaceholder from "@/assets/images/profile/bear.png";

export default function LeaderProfile({ params }: { params: Promise<{ id: string }> }) {
  // 1. Unwrap params for Next.js 15
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { backendGet } = useRequesters();
  const router = useRouter();
  const [leader, setLeader] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [tripCount, setTripCount] = useState(0);
  const [pastTrips, setPastTrips] = useState<any[]>([]);

  //NOTE: backendGet must NOT be a dependency here. It changes identity whenever the
  //session does, and this effect sets state on every run - together that loops forever.
  useEffect(() => {
    const fetchPageData = async () => {
      // 2. Retrieve static leader data from Firestore
      const leaderSnap = await getDoc(doc(db, "team", id));
      if (!leaderSnap.exists()) {
        setNotFound(true);
        return;
      }
      const data = leaderSnap.data();
      setLeader(data);

      const nameParts = data.name.split(" ");
      const first = nameParts[0];
      const last = nameParts.slice(1).join(" ");

      try {
        // 3. Retrieve relational stats and trip history from MySQL
        //These routes are public, so request them without auth - otherwise logged-out
        //visitors get no stats at all, which is exactly who this page is for.
        const [statsRes, tripsRes] = await Promise.all([
          backendGet(`/public/leader-stats/${first}/${last}`, true),
          backendGet(`/public/leader-trips/${first}/${last}`, true)
        ]);

        setTripCount(statsRes.data.totalTrips);
        // Separate past trips using existing date logic
        setPastTrips(tripsRes.data.filter((t: any) => new Date(t.date) < new Date()));
      } catch (err) {
        console.error("SQL fetch failed", err);
      }
    };
    fetchPageData();
  }, [id]);

  if (notFound) return (
    <div className="p-10 text-center font-funky text-boc_darkbrown text-2xl">
      We couldn't find that leader.{" "}
      <Link href="/about/our-team" className="underline">Back to Our Team</Link>
    </div>
  );
  if (!leader) return <div className="p-10 text-center font-funky text-boc_darkbrown text-2xl">Loading...</div>;

  return (
    /* Main container with pb-16 for a balanced bottom gap */
    <main className="px-6 sm:px-10 desktop:px-20 pt-8 pb-24">
      
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
      {/* The three-column form needs 250+250+gaps, so it can't come in before `desktop`;
          below that the photo, name and badge stack and centre. */}
      <div className="grid grid-cols-1 desktop:grid-cols-[250px_1fr_250px] items-center gap-8 border-b-2 border-boc_darkbrown pb-8">

        {/* Profile Photo: Single Frame */}
        <div className="flex justify-center desktop:justify-start">
          <div className="border-[6px] border-[#d2b48c] shadow-md overflow-hidden bg-white w-56 h-56 shrink-0">
            <img src={leader.image || photoPlaceholder.src} alt={leader.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Name & Title: All Brown Theme */}
        <div className="flex flex-col items-center text-center">
          {/* desktop:leading-[1.1] restates the leading the desktop:text-6xl media query
              would otherwise override - same for the leading-none on the badge below. */}
          <h1 className="text-4xl sm:text-5xl desktop:text-6xl font-funky text-boc_darkbrown leading-[1.1] desktop:leading-[1.1]">
            <b>{leader.name}</b>
          </h1>
          <p className="text-xl desktop:text-2xl text-boc_darkbrown italic mt-1 opacity-80">{leader.position}</p>
        </div>

        {/* Trips Badge */}
        <div className="flex justify-center desktop:justify-end">
          <div className="w-36 desktop:w-48 text-center shrink-0">
            <p className="text-base desktop:text-xl font-bold text-boc_darkbrown uppercase tracking-widest leading-none desktop:leading-none mb-1">
              Summit Seeker
            </p>
            <div className="relative w-full aspect-square flex items-center justify-center">
              <img src={tripsBadge.src} alt="badge" className="absolute inset-0 w-full h-full object-contain" />
              <span className="relative z-10 text-white font-bold text-4xl desktop:text-5xl pt-1">
                {tripCount}
              </span>
            </div>
            <p className="text-base desktop:text-xl font-bold text-boc_darkbrown uppercase tracking-widest leading-none desktop:leading-none mt-1">
              Total Trips
            </p>
          </div>
        </div>
      </div>

      {/* About Section: Full width text */}
      <div className="mt-8 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-boc_darkbrown mb-3 font-funky">
          About
        </h2>
        <p className="text-lg sm:text-xl leading-relaxed sm:leading-relaxed text-gray-800">
          {leader.bio || "This leader hasn't added a bio yet."}
        </p>
      </div>

      {/* Past Trips Table: Card-row style */}
      <div className="mt-12 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-boc_darkbrown mb-6 font-funky border-b-2 border-boc_darkbrown pb-2">
          Past Trips
        </h2>
        
        {pastTrips.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Below sm the two columns don't fit and the date gets clipped, so the table
                switches to `display: block` and each row becomes a stacked card: name and
                blurb on top, date beneath. Every `sm:` class here restores the real table. */}
            <table className="block sm:table w-full text-left border-separate border-spacing-y-3">
              <thead className="hidden sm:table-header-group">
                <tr className="text-boc_darkbrown text-lg font-bold">
                  <th className="px-4 pb-2">Trip Name</th>
                  <th className="px-4 pb-2 text-center">Date</th>
                </tr>
              </thead>
              <tbody className="block sm:table-row-group">
                {pastTrips.map((trip) => (
                  <tr
                    key={trip.tripId}
                    className="block sm:table-row mb-3 sm:mb-0 group hover:scale-[1.01] transition-transform cursor-pointer"
                    onClick={() => router.push(`/trips/view?id=${trip.tripId}`)}
                  >
                    <td className="block sm:table-cell p-5 pb-0 sm:pb-5 rounded-t-xl sm:rounded-tr-none sm:rounded-bl-xl border-x-2 border-t-2 sm:border-r-0 sm:border-b-2 border-boc_darkbrown bg-white/40 group-hover:bg-white transition-colors">
                      <p className="font-bold text-xl sm:text-2xl text-boc_darkbrown">{trip.tripName}</p>
                      <p className="text-gray-600 line-clamp-1 mt-1">{trip.sentenceDesc}</p>
                    </td>
                    <td className="block sm:table-cell p-5 pt-2 sm:pt-5 rounded-b-xl sm:rounded-bl-none sm:rounded-tr-xl border-x-2 border-b-2 sm:border-l-0 sm:border-t-2 border-boc_darkbrown bg-white/40 group-hover:bg-white transition-colors text-left sm:text-center font-bold text-xl sm:text-2xl text-boc_darkbrown">
                      {formatDateString(trip.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-lg sm:text-xl text-boc_darkbrown italic border-2 border-dashed border-boc_darkbrown rounded-xl p-6 sm:p-10 text-center opacity-60">
            No past trips recorded yet!
          </p>
        )}
      </div>
    </main>
  );
}