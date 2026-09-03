"use client";
import React, { useEffect, useRef, useState } from "react";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Title from "@/components/Title";
import db from "@/scripts/firebase";
import { useRequesters } from "@/scripts/requests";
import { Role } from "@/models/models";
import Link from "next/link";
import { useRouter } from "next/navigation";
import photoPlaceholder from "@/assets/images/profile/bear.png";
import { signInAsLeader, handleEditError } from "./leaderAuth";
import { CoreSlot, loadCoreSlots, partitionTeam } from "./coreLeadership";

type ResourceData = {
  id: string;
  name: string;
  image: string;
  index: number;
  display: boolean;
  email?: string;
  //Legacy, pre-migration only: position now lives on the core slot, and core membership
  //is being a slot's `leader` rather than carrying category === "core".
  position?: string;
  category?: string;
  bio?: string;
};

//What GET /user sends back - narrower than models' User, which also carries trip counts
type Viewer = { firstName: string; lastName: string; email: string; role: Role };

const NEW_LEADER_BIO = "I'm a new leader, and I haven't created my blurb yet!";

export default function Team() {
  const [info, setData] = useState<ResourceData[]>([]);
  const [coreSlots, setCoreSlots] = useState<CoreSlot[]>([]);
  const [teamLink, setTeamLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [isAboveFooter, setIsAboveFooter] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const reqs = useRequesters();
  const { backendGet } = reqs;
  const router = useRouter();

  // 1. Simplify the Card (Remove the router.push)
  function Card({ resource, position }: { resource: ResourceData, position?: string }) {
    const imagePath = resource.image || photoPlaceholder.src;

    // mx-auto is phone-only: the one-per-row link is full width, so a card narrower
    // than it (max-w-sm, binding above ~432px) would sit flush left. Reset at sm so
    // the tablet and desktop rows keep their existing alignment.
    return (
      <div className="flex flex-col items-center w-full max-w-sm mx-auto sm:mx-0 cursor-pointer group outline-none">
        <div className="w-full aspect-square overflow-hidden rounded-2xl shadow-lg mb-4 transition-transform duration-200 group-hover:scale-[1.02]">
          <img className="w-full h-full object-cover" src={imagePath} alt={resource.name} />
        </div>
        {/* desktop:leading-tight is required: a responsive text-* utility also sets
            line-height, and its media query would otherwise beat the base leading-tight. */}
        <h2 className="font-funky text-gray-800 text-base sm:text-xl desktop:text-2xl font-semibold text-center leading-tight desktop:leading-tight">
          {resource.name}
        </h2>
        {position && (
          <p className="text-gray-600 text-sm sm:text-base desktop:text-lg text-center mt-1">{position}</p>
        )}
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "team"));
        const queryAssets = await getDoc(doc(db, "assets", "team-picture"));
        setCoreSlots(await loadCoreSlots());
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ResourceData));
        setData(documents);
        setTeamLink(queryAssets?.data()?.link);
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    //A 401 here is just the ordinary signed-out case - no button, no error
    backendGet("/user")
      .then((res): void => setViewer(res.data))
      .catch((e): void => { if (e.status !== 401) console.error(`Fetching user data failed: ${e}`); });
  }, [backendGet]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setIsAboveFooter(entry.isIntersecting); },
      { root: null, threshold: 0 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => { if (sentinelRef.current) observer.unobserve(sentinelRef.current); };
  }, [loading]); //The sentinel only exists once the loading placeholder is replaced

  //Send a leader to their own profile, creating one the first time they ask for it. The
  //docs are already loaded for the grid, so finding it costs no extra Firestore reads.
  const goToMyProfile = async () => {
    if (!viewer) return;
    const mine = info.find((m) => m.email?.toLowerCase() === viewer.email.toLowerCase());
    if (mine) {
      router.push(`/about/our-team/${mine.id}`);
      return;
    }

    try {
      await signInAsLeader(reqs); //The write below is gated on the Firebase identity
      const slug = `${viewer.firstName}-${viewer.lastName}`.toLowerCase().replace(/\s+/g, "-");
      let id = slug;
      for (let n = 2; info.some((m) => m.id === id); n++) id = `${slug}-${n}`;

      await setDoc(doc(db, "team", id), {
        //Must be exactly "First Last": /public/leader-stats splits this to look up trip counts
        name: `${viewer.firstName} ${viewer.lastName}`,
        email: viewer.email,
        image: "", //Falsy, so both team pages fall back to the bear placeholder
        bio: NEW_LEADER_BIO,
        //No category or position: a new leader holds no core slot, and `index` orders only
        //the trip leader grid they land in.
        index: Math.max(0, ...info.map((m) => m.index)) + 1,
        display: true,
      });
      router.push(`/about/our-team/${id}`);
    } catch (err) {
      handleEditError(err);
    }
  };

  const { core: coreLeadership, general: tripLeaders } = partitionTeam(info, coreSlots);

  if (loading) return <div className="p-20 text-center font-funky text-xl">Loading...</div>;

  return (
    <div className="relative min-h-screen w-full px-6 sm:px-10 desktop:px-20 py-10">

      <Title text="Our Team" />
      
      <section className="flex flex-col items-center mt-8">
        <h1 className="text-3xl sm:text-4xl font-bold py-5 mb-4 text-center">Core Leadership</h1>
        {/* One officer per row on phones so their photos stay large; two from sm up, then
            the natural max-w-sm flow of the cards themselves once there's room. */}
        <div className="flex flex-wrap justify-center gap-10 w-full">
          {coreLeadership.map(({ member, position }) => (
            <Link href={`/about/our-team/${member.id}`} key={member.id} className="w-full sm:w-[calc(50%-1.25rem)] desktop:w-auto transition-transform hover:scale-105">
              <Card resource={member} position={position} />
            </Link>
          ))}
        </div>

        {/* Spacer replaces the blue lines */}
        <div className="h-10 sm:h-20 w-full" />

        <h1 className="text-3xl sm:text-4xl font-bold py-5 mb-4 text-center">Trip Leaders</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 desktop:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12 w-full max-w-7xl px-0 sm:px-4">
          {tripLeaders.map((member) => (
            <Link href={`/about/our-team/${member.id}`} key={member.id} className="transition-transform hover:scale-105">
              <Card resource={member} />
            </Link>
          ))}
        </div>

        <div className="h-12 sm:h-24 w-full" />

        {/* <h1 className="text-4xl font-bold py-5 mb-4 text-center">Team Picture</h1>
        <div className="w-full flex justify-center">
          <img className="w-full max-w-5xl object-cover rounded-3xl shadow-xl" src={teamLink} alt="Outing Club Group" />
        </div> */}
      </section>

      <section>
      <div className="w-full px-0 sm:px-10 desktop:px-20 py-10">
      <hr className="bg-boc_medbrown border-0 h-[2px] my-5" />
      <h2 className="text-xl sm:text-2xl font-bold text-center">Can't find who you're looking for?</h2>
	<p className="text-center">Check out our <a href="https://docs.google.com/presentation/d/126AAnBdr9MDmfMszCapoj9YNie0rActtkxj0L3VLH9w/edit#slide=id.ge9c455096b_0_1941" 
	className="underline text-blue-600">complete BOC roster</a> here!</p>
      </div>
      </section>

      {viewer && [Role.Leader, Role.Admin].includes(viewer.role) && (
        <>
          {/* Mirrors the trips page's creation button, down to the collapse: touch devices
              have no hover, so below desktop the label stays out rather than leaving mobile
              leaders an unlabelled icon. */}
          <div className={`transition-all duration-200 ${isAboveFooter ? "absolute bottom-4 right-4" : "fixed bottom-4 right-4"}`}>
            {/* px-3 rather than the trips button's px-4 so the 24px icon exactly fills the
                collapsed 48px circle instead of being clipped by overflow-hidden */}
            <button
              className="group flex items-center gap-2 bg-boc_darkbrown text-background text-lg font-semibold px-3 h-12 rounded-full transition-all duration-1000 overflow-hidden w-40 desktop:w-12 desktop:hover:w-40"
              onClick={goToMyProfile}
            >
              <PencilSquareIcon className="h-6 w-6 shrink-0" />
              <span className="whitespace-nowrap transition-none desktop:opacity-0 desktop:group-hover:opacity-100">
                My Profile
              </span>
            </button>
          </div>
          {/* Sentinel for positioning the edit button */}
          <div ref={sentinelRef} className="w-full absolute bottom-0"></div>
        </>
      )}
    </div>
  );
}
