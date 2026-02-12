"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Title from "@/components/Title";
import db from "@/scripts/firebase";
import Link from "next/link";

type ResourceData = {
  id: string;
  name: string;
  image: string;
  index: number;
  display: boolean;
  position: string;
  category: string;
  email?: string;
};

export default function Team() {
  const [info, setData] = useState<ResourceData[]>([]);
  const [teamLink, setTeamLink] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Simplify the Card (Remove the router.push)
  function Card({ resource }: { resource: ResourceData }) {
    const isGeneral = resource.category === "general";
    const imagePath = resource.image || "https://via.placeholder.com/400?text=Photo+Coming+Soon";

    return (
      <div className="flex flex-col items-center w-full max-w-sm cursor-pointer group outline-none">
        <div className="w-full aspect-square overflow-hidden rounded-2xl shadow-lg mb-4 transition-transform duration-200 group-hover:scale-[1.02]">
          <img className="w-full h-full object-cover" src={imagePath} alt={resource.name} />
        </div>
        <h2 className="font-funky text-gray-800 text-2xl font-semibold text-center leading-tight">
          {resource.name}
        </h2>
        {!isGeneral && (
          <p className="text-gray-600 text-lg text-center mt-1">{resource.position}</p>
        )}
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "team"));
        const queryAssets = await getDoc(doc(db, "assets", "team-picture"));
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

  const coreLeadership = info.filter(m => m.category === "core" && m.display !== false).sort((a, b) => a.index - b.index);
  const tripLeaders = info.filter(m => m.category === "general" && m.display !== false).sort((a, b) => a.index - b.index);

  if (loading) return <div className="p-20 text-center font-funky text-xl">Loading...</div>;

  return (
    <div className="min-h-screen w-full px-10 md:px-20 py-10">

      <Title text="Our Team" />
      
      <section className="flex flex-col items-center mt-8">
        <h1 className="text-4xl font-bold py-5 mb-4 text-center">Core Leadership</h1>
        <div className="flex flex-wrap justify-center gap-10">
          {coreLeadership.map((member) => (
            <Link href={`/about/our-team/${member.id}`} key={member.id} className="transition-transform hover:scale-105">
              <Card resource={member} />
            </Link>
          ))}
        </div>

        {/* Spacer replaces the blue lines */}
        <div className="h-20 w-full" />

        <h1 className="text-4xl font-bold py-5 mb-4 text-center">Trip Leaders</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 w-full max-w-7xl px-4">
          {tripLeaders.map((member) => (
            <Link href={`/about/our-team/${member.id}`} key={member.id} className="transition-transform hover:scale-105">
              <Card resource={member} />
            </Link>
          ))}
        </div>

        <div className="h-24 w-full" />
        
        {/* <h1 className="text-4xl font-bold py-5 mb-4 text-center">Team Picture</h1>
        <div className="w-full flex justify-center">
          <img className="w-full max-w-5xl object-cover rounded-3xl shadow-xl" src={teamLink} alt="Outing Club Group" />
        </div> */}
      </section>
    </div>
  );
}