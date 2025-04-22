"use client";
import NavBar from "@/components/NavBar";
import Title from "@/components/Title"

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import db from "@/scripts/firebase";

// Represents leadership mappings for one year

interface LeadershipYear {
  [role: string]: string[]; // Each role can have an array of names
}
interface LeadershipData {
  [year: string]: LeadershipYear;
}

function LeadershipList(leadershipData: Object) {
  const posSorter = (a, b) => {
    let a_val = 0;
    let b_val = 0;
    if(a[0] == "Presidents") {
      a_val = 2;
    } 
    if(b[0] == "Presidents") {
      b_val = 2;
    }
    return a_val <= b_val;
  }

  const yearSorter = (a, b) => {
    return a[0] < b[0];
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(leadershipData).sort(yearSorter).map(([year, data]) => (
        <div key={year} className="border-[1px] border-black min-h-[150px]">
          <h2 className="p-2 font-bold italic">{year} Executive Leadership</h2>
          {Object.entries(data).sort(posSorter).map(([title, value], index) => {
            if (!value) return null;

            return (
              <div key={index}>
                <span>
                  <strong>{title}:</strong>
                </span>
                <span> {value.join(" & ")}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Leadership() {
  const [data, setData] = useState<LeadershipData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "leadership"));
        const documents = querySnapshot.docs;
        const data = Object.fromEntries(
          documents.map((doc) => [doc.id, doc.data()]),
        );
        setData(data);
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return <div>{loading ? <p>Loading...</p> : LeadershipList(data)}</div>;
}

export default function MeetOurTeam() {
  return (
    <div className="h-full min-h-screen w-full">
      <NavBar></NavBar>
      <Title text="Past Leadership" />
      {/* Dynamic spacer based on header height */}
      <div id="content" className="text-center p-14 pt-0">
        <Leadership />
        <div className="flex justify-center"></div>
      </div>
      <div className="mb-[5vh]"></div>
    </div>
  );
}
