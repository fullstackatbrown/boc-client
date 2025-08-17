"use client";
import React from "react";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import db from "@/scripts/firebase";
import Title from "@/components/Title";

//PAGE DISABLED CURRENTLY

type ResourceData = {
  name: string;
  date: {
    seconds: number;
    nanoseconds: number;
  };
  image: string;
  location: number;
};

export default function Team() {
  const [info, setData] = useState<Object>({});
  const [teamLink, setTeamLink] = useState();
  const [loading, setLoading] = useState(true);

  const [selectedResource, setSelectedResource] = useState<ResourceData>();

  const eventSorter = (a: any, b: any) => {
    // Events without dates should go to beginning
    if (a.date && !b.date) {
      return 1;
    } else if (!a.date && b.date) {
      return -1;
    } else if (!a.date && !b.date) {
      return 0;
    }

    // Events that occurred should go to end
    if (a.occurred && !b.occurred) {
      return 1;
    } else if (!a.occurred && b.occurred) {
      return -1;
    } else if (a.occurred && b.occurred) {
      return b.date.seconds - a.date.seconds;
    }

    // Sort by date if all else goes through
    return a.date.seconds - b.date.seconds;
  };

  function Card(props: any) {
    return (
      <div className="rounded-lg p-6 flex flex-col items-center max-w-sm">
        <img
          className="w-80 h-80 object-cover rounded-2xl mb-4 mx-auto shadow-lg"
          src={props.resource.image}
          alt={props.resource.name}
        />
        <h2 className="font-funky text-gray-800 text-2xl font-semibold text-center py-2">
          {props.resource.name}
        </h2>
        <h2 className="text-gray-800 text-2xl font-semibold text-center py-2">
          {props.resource.location} - {Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "UTC",
          }).format(props.resource.date.seconds * 1000)}
        </h2>
        <a href={props.resource.link}><u>See more...</u></a>
      </div>
    );
  }

  function Section() {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className={`flex flex-wrap justify-center gap-6 px-10`}>
          {Object.values(info)
            .sort((a, b) => a.index - b.index)
            .map((resource, index) => (
              <Card resource={resource} key={index} />
            ))}
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "photo-album"));
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

  return (
    <div className="h-full w-full px-20 py-10">
      {/* Site content */}
      <Title text="Photo Album" />
      <section className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center pb-10">
          <hr className="my-4 border-t-2 border-gray-300" />

          <div className="flex flex-col items-center justify-center">
            <Section />
          </div>
        </div>
      </section>
    </div>
  );
}
