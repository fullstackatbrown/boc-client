"use client";
import React from "react";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Title from "@/components/Title";
import db from "@/scripts/firebase";

type ResourceData = {
  name: string;
  image: string;
  index: number;
  display: boolean;
  position: string;
};

function TeamHeader(props: any) {
  return (
    <b>
      <h1 className="text-4xl py-5 mb-8">{props.text}</h1>
    </b>
  );
}

export default function Team() {
  const [info, setData] = useState<Object>({});
  const [teamLink, setTeamLink] = useState();
  const [loading, setLoading] = useState(true);

  const [selectedResource, setSelectedResource] = useState<ResourceData>();

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
          {props.resource.position}
        </h2>
      </div>
    );
  }

  function Section(props: any) {
    return (
      <div className="flex flex-col items-center justify-center">
        <TeamHeader text={props.header} />
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

  function TeamPicture() {
    return (
      <div className="flex flex-col items-center justify-center">
        <TeamHeader text="Team Picture" />
        <div className={`flex flex-wrap justify-center gap-6 px-10`}>
          <img
            className="object-cover rounded-2xl mb-4 mx-auto shadow-lg"
            src={teamLink}
          />
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "team"));
        const queryAssets = await getDoc(doc(db, "assets", "team-picture"));

        const documents = querySnapshot.docs;
        const data = Object.fromEntries(
          documents.map((doc) => [doc.id, doc.data()]),
        );
        setData(data);
        setTeamLink(queryAssets?.data()?.link);
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
      <Title text="Our Team" />
      <section className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center pb-10">
          <div className="flex flex-col items-center justify-center">
            <Section header="Core Leadership" keyword="Leadership" width={3} />
            <hr className="my-10" />
            <TeamPicture />
          </div>
        </div>
      </section>
    </div>
  );
}
