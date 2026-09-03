"use client";
import React, { use, useEffect, useRef, useState } from "react";
import { useRequesters } from "@/scripts/requests";
import { TripStatus } from "@/models/models";
import db, { storage } from "@/scripts/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateString } from "@/utils/utils";
import { signInAsLeader, handleEditError } from "../leaderAuth";
import { loadCoreSlots, positionFor } from "../coreLeadership";

// Assets imported from your original structure
import tripsBadge from "@/assets/images/profile/badge.png";
import photoPlaceholder from "@/assets/images/profile/bear.png";

//Trips led but not yet run, versus trips that have. Staging is in neither: it's unpublished
//and this page is public.
const CURRENT_STATUSES: string[] = [TripStatus.Open, TripStatus.PreTrip];
const PAST_STATUSES: string[] = [TripStatus.PostTrip, TripStatus.Complete];

//Both sections render the same table; only the heading and the empty-state copy differ.
function TripTable(props: { heading: string, emptyText: string, trips: any[], onOpen: (tripId: number) => void }) {
  return (
    <div className="mt-12 w-full">
      <h2 className="text-2xl sm:text-3xl font-bold text-boc_darkbrown mb-6 font-funky border-b-2 border-boc_darkbrown pb-2">
        {props.heading}
      </h2>

      {props.trips.length > 0 ? (
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
              {props.trips.map((trip) => (
                /* Rest slightly under full width and grow *to* it, rather than past it:
                   scaling up from 100% pushed the row ~6px out of the overflow-x-auto
                   wrapper on each side and raised a scrollbar. */
                <tr
                  key={trip.tripId}
                  className="block sm:table-row mb-3 sm:mb-0 group scale-[0.99] hover:scale-100 transition-transform cursor-pointer"
                  onClick={() => props.onOpen(trip.tripId)}
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
          {props.emptyText}
        </p>
      )}
    </div>
  );
}

export default function LeaderProfile({ params }: { params: Promise<{ id: string }> }) {
  // 1. Unwrap params for Next.js 15
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const reqs = useRequesters();
  const { backendGet } = reqs;
  const router = useRouter();
  const openTrip = (tripId: number) => router.push(`/trips/view?id=${tripId}`);
  const [leader, setLeader] = useState<any>(null);
  const [position, setPosition] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [tripCount, setTripCount] = useState(0);
  const [currentTrips, setCurrentTrips] = useState<any[]>([]);
  const [pastTrips, setPastTrips] = useState<any[]>([]);
  const [viewer, setViewer] = useState<any>(null);
  const [editingBio, setEditingBio] = useState(false);
  const [bioVal, setBioVal] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

      //The position is a property of the core slot this leader holds, not of the leader, so
      //it disappears by itself when a slot is reassigned. Nothing shows if no slot points here.
      setPosition(positionFor(id, await loadCoreSlots()));

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
        //Split on the trip's status, never on its date: `new Date("yyyy-mm-dd")` parses as
        //UTC and shifts the day backwards, and a date alone can't tell a trip that ran from
        //one that was abandoned. Staging trips are unpublished, so they appear in neither.
        setCurrentTrips(tripsRes.data.filter((t: any) => CURRENT_STATUSES.includes(t.status)));
        setPastTrips(tripsRes.data.filter((t: any) => PAST_STATUSES.includes(t.status)));
      } catch (err) {
        console.error("SQL fetch failed", err);
      }
    };
    fetchPageData();
  }, [id]);

  useEffect(() => {
    //A 401 is just the ordinary signed-out visitor, who gets the read-only page
    backendGet("/user")
      .then((res): void => setViewer(res.data))
      .catch((e): void => { if (e.status !== 401) console.error(`Fetching user data failed: ${e}`); });
  }, [backendGet]);

  //Own page only. The Firestore rules let a leader update just their own doc, so offering
  //an admin controls on anyone else's would only ever produce a denied write.
  const canEdit = !!viewer && !!leader?.email &&
    viewer.email?.toLowerCase() === leader.email.toLowerCase();

  const saveBio = async () => {
    try {
      await signInAsLeader(reqs);
      await updateDoc(doc(db, "team", id), { bio: bioVal });
      window.location.reload();
    } catch (err) {
      handleEditError(err);
    }
  };

  const uploadPhoto = async (file: File) => {
    //The Storage rule caps type and size too, but failing here gives a usable message
    if (!file.type.startsWith("image/")) return alert("That doesn't look like an image file.");
    if (file.size > 5 * 1024 * 1024) return alert("That image is too large - please pick one under 5MB.");

    setUploading(true);
    try {
      const fbUser = await signInAsLeader(reqs);
      const ext = file.name.split(".").pop() || "jpg";
      //The uid segment is what makes the Storage rule expressible: a leader may only write
      //under their own folder.
      const dest = ref(storage, `LeaderPhotos/${fbUser.uid}/${Date.now()}.${ext}`);
      await uploadBytes(dest, file);
      await updateDoc(doc(db, "team", id), { image: await getDownloadURL(dest) });

      //Clean up the replaced file, but only ever one of our own uploads - the curated
      //CoreLeaders/GeneralLeaders originals are shared and must survive a photo swap.
      //Runs after the doc update so a failed delete can never orphan the profile.
      if (typeof leader.image === "string" && leader.image.includes("/o/LeaderPhotos%2F")) {
        await deleteObject(ref(storage, leader.image)).catch((e) => console.log(e));
      }
      window.location.reload();
    } catch (err) {
      setUploading(false);
      handleEditError(err);
    }
  };

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
          {/* The frame clips its own contents, so the edit badge hangs off this wrapper */}
          <div className="relative shrink-0">
            <div className="border-[6px] border-[#d2b48c] shadow-md overflow-hidden bg-white w-56 h-56">
              <img src={leader.image || photoPlaceholder.src} alt={leader.name} className="w-full h-full object-cover" />
            </div>
            {canEdit && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }}
                />
                {/* A permanent badge rather than a hover overlay - touch devices have no hover */}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  aria-label="Change profile photo"
                  className="absolute -bottom-2 -right-2 flex items-center justify-center w-11 h-11 rounded-full bg-boc_darkbrown text-background shadow-md hover:bg-boc_darkgreen transition-colors disabled:opacity-60"
                >
                  <PencilSquareIcon className="w-6 h-6" />
                </button>
              </>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold">
                Uploading...
              </div>
            )}
          </div>
        </div>

        {/* Name & Title: All Brown Theme */}
        <div className="flex flex-col items-center text-center">
          {/* desktop:leading-[1.1] restates the leading the desktop:text-6xl media query
              would otherwise override - same for the leading-none on the badge below. */}
          <h1 className="text-4xl sm:text-5xl desktop:text-6xl font-funky text-boc_darkbrown leading-[1.1] desktop:leading-[1.1]">
            <b>{leader.name}</b>
          </h1>
          {position && (
            <p className="text-xl desktop:text-2xl text-boc_darkbrown italic mt-1 opacity-80">{position}</p>
          )}
        </div>

        {/* Trips Badge */}
        <div className="flex justify-center desktop:justify-end">
          <div className="w-36 desktop:w-48 text-center shrink-0">
            <div className="relative w-full aspect-square flex items-center justify-center">
              <img src={tripsBadge.src} alt="badge" className="absolute inset-0 w-full h-full object-contain" />
              <span className="relative z-10 text-white font-bold text-4xl desktop:text-5xl pt-1">
                {tripCount}
              </span>
            </div>
            <p className="text-base desktop:text-xl font-bold text-boc_darkbrown uppercase tracking-widest leading-none desktop:leading-none mt-1">
              Trips Led
            </p>
          </div>
        </div>
      </div>

      {/* About Section: Full width text */}
      <div className="mt-8 w-full">
        {/* flex, not an inline icon: an inline-block pencil overhangs the line box and grows
            the heading by 2px, nudging everything below it down for editors only. */}
        <h2 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-boc_darkbrown mb-3 font-funky">
          About
          {canEdit && !editingBio && (
            <button
              onClick={() => { setBioVal(leader.bio || ""); setEditingBio(true); }}
              aria-label="Edit blurb"
              className="text-boc_medbrown hover:text-boc_darkbrown transition-colors"
            >
              <PencilSquareIcon className="w-6 h-6 block" />
            </button>
          )}
        </h2>
        {/* A textarea with explicit Save, not the trip pages' Enter-to-submit EditableString -
            a blurb is a paragraph, and Enter has to mean newline. */}
        {editingBio ? (
          //Click-outside cancels, as the trip pages' EditableString does. The check keeps
          //focus moves *within* the editor (tabbing to Save) from counting as leaving it.
          <div onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEditingBio(false);
          }}>
            <textarea
              value={bioVal}
              onChange={(e) => setBioVal(e.target.value)}
              rows={6}
              autoFocus
              className="w-full border border-gray-300 rounded px-2 py-1 text-lg sm:text-xl leading-relaxed sm:leading-relaxed"
            />
            <div className="flex gap-3 mt-2">
              {/* Suppressing mousedown keeps focus in the textarea, so clicking Save never
                  blurs it. Safari and Firefox don't focus a button on click, so relatedTarget
                  alone would read as "left the editor" and cancel the save. */}
              <button onMouseDown={(e) => e.preventDefault()} onClick={saveBio} className="bg-boc_darkbrown text-background font-bold py-2 px-4 rounded-full hover:bg-boc_darkgreen transition duration-300 ease-in-out">
                Save
              </button>
              <button onClick={() => setEditingBio(false)} className="border-2 border-boc_darkbrown text-boc_darkbrown font-bold py-2 px-4 rounded-full hover:bg-boc_lightbrown transition duration-300 ease-in-out">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-lg sm:text-xl leading-relaxed sm:leading-relaxed text-gray-800">
            {leader.bio || "This leader hasn't added a bio yet."}
          </p>
        )}
      </div>

      {/* Two sections, split on trip status: what this leader is running now, and what
          they have already run. The badge above equals the Past Trips row count. */}
      <TripTable
        heading="Current Trips"
        emptyText="No trips on the calendar right now!"
        trips={currentTrips}
        onOpen={openTrip}
      />
      <TripTable
        heading="Past Trips"
        emptyText="No past trips recorded yet!"
        trips={pastTrips}
        onOpen={openTrip}
      />
    </main>
  );
}