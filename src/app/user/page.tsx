"use client";
import NavBar from "@/components/NavBar";
import WhiteWaterBanner from "@/components/WhiteWaterBanner";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

function Subheading(props: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-bold mb-5 mt-10">{props.children}</h1>;
}

function Paragraph(props: { children: React.ReactNode }) {
  return (
    <div className="text-xl font-[100] text-left leading-10 mb-3">
      <p>{props.children}</p>
    </div>
  );
}

interface Trip {
  trip: string;
  date: string;
  leaders: string[];
}

const mock_data = {
  upcomingTrips: [
    {
      trip: "Trip 1",
      date: "2023-10-01",
      leaders: ["Moses Y", "Sofia G"],
    },
    {
      trip: "Trip 2",
      date: "2023-11-01",
      leaders: ["Sofia G", "Kieran L"],
    },
  ],
  pastTrips: [
    {
      trip: "Trip A",
      date: "2023-09-01",
      leaders: ["Alan Wang", "William Stone"],
    },
    {
      trip: "Trip B",
      date: "2023-08-01",
      leaders: ["William Stone", "Alan Wang"],
    },
  ],
};

function Td(props: { children: React.ReactNode }) {
  return (
    <td className="p-[0.7em] text-left text-[1.200rem]">{props.children}</td>
  );
}

function TripRow(data: Trip) {
  return (
    <tr className="divide-x divide-black px-4 py-2">
      <Td>{data.trip}</Td>
      <Td>{data.date}</Td>
      <Td>
        {data.leaders.map((leader, index) => (
          <div key={leader}>{leader}</div>
        ))}
      </Td>
    </tr>
  );
}

// create a table for all upcoming trips
function tripTable(isPast: boolean, trips: Trip[]) {
  const timing = isPast ? "Past" : "Upcoming";

  return (
    <div className="flex flex-col mb-10 mx-10">
      <div className="border-b border-gray-700 border-radius w-[95%] mb-10 mx-auto">
        <div className="ml-4">
          <Subheading>{timing} Trips</Subheading>
        </div>
      </div>
      <div className="flex justify-center">
        <table className="table-fixed w-full border border-black">
          <colgroup>
            <col style={{ width: "60%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <tbody className="divide-y divide-black">
            <tr className="divide-x divide-black px-4 py-2 text-center font-bold">
              <Td>Trip:</Td>
              <Td>Date</Td>
              <Td>Leaders</Td>
            </tr>
            {trips.map((data, index) => (
              <TripRow key={index} {...data} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function User() {
  const [userProfile, setUserProfile] = useState({
    name: "",
    role: "",
    email: "",
    phoneNum: "",
    tripsParticipated: "",
  });
  const updateLogin = async () => {
    try {
      const { data: userData } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/user/profile`,
        {
          headers: {
            token: localStorage.getItem("access_token"),
          },
        }
      );

      setUserProfile({
        name: `${userData.firstName} ${userData.lastName}`,
        role: `${userData.role} `,
        email: `${userData.email} `,
        phoneNum: `${userData.phone} `,
        tripsParticipated: `${userData.tripsParticipated} `,
      });
    } catch (error) {
      setUserProfile({
        name: "",
        role: "",
        email: "",
        phoneNum: "",
        tripsParticipated: "",
      });
      console.log("ERROR");
    }
  };

  useEffect(() => {
    updateLogin();
  }, []);

  return (
    <div className="h-full min-h-screen w-full">
      <NavBar></NavBar>

      {/* Site content */}
      <WhiteWaterBanner text="User Profile"></WhiteWaterBanner>

      <div id="content" className="flex justify-center items-start gap-10 p-5">
        <div className="w-60 aspect-square flex justify-center rounded-lg object cover bg-gray-200">
          <img alt="User Profile" className="w-1/2 rounded-lg object cover" />
        </div>
        <div className="text-[1.200rem] leading-loose">
          <div>
            <b>Name: </b>
            {userProfile.name}
          </div>
          <div>
            {" "}
            <b>BOC Position:</b> {userProfile.role}
          </div>
          <div>
            <b>E-mail:</b> {userProfile.email}
          </div>
          <div>
            <b>Phone Number: </b>
            {userProfile.phoneNum}
          </div>
        </div>
        <div
          style={{ backgroundColor: "#5CB85B" }}
          className="w-1/4 text-center rounded-lg shadow-md"
        >
          <p className="text-2xl font-bold text-white pt-7">Summit Seeker</p>
          <hr className="border-t-2 border-white w-full my-4" />

          <div className="pb-7">
            <p
              style={{ color: "#FFFFFFBF" }}
              className="text-2xl font-bold text-white"
            >
              Total Trips:
            </p>
            <p className="text-3xl font-bold text-white">
              {userProfile.tripsParticipated}
            </p>
          </div>
        </div>
        <div
          style={{ backgroundColor: "#5CB85B" }}
          className="w-1/4 text-center rounded-lg shadow-md"
        >
          <p className="text-2xl font-bold text-white pt-7">Novice</p>
          <hr className="border-t-2 border-white w-full my-4" />

          <div className="pb-7">
            <p
              style={{ color: "#FFFFFFBF" }}
              className="text-2xl font-bold text-white"
            >
              Total Trip Types:
            </p>
            <p className="text-3xl font-bold text-white">
              {userProfile.tripsParticipated} / 24
            </p>
          </div>
        </div>
      </div>
      {tripTable(false, mock_data.upcomingTrips)}
      {tripTable(true, mock_data.pastTrips)}
    </div>
  );
}
