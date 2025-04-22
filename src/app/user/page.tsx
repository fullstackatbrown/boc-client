"use client";
import NavBar from "@/components/NavBar";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import tripsBadge from "@/assets/images/trips_badge.png";
import profilepic from "@/assets/images/bear.png";
import wood from "@/assets/images/wood.png";

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

// represents trip info from user/profile route
interface TripSignUp {
  tripId: number;
  tripRole: string;
  status: string | null;
  needPaperwork: boolean | null;
  confirmed: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface Trip {
  tripName: string;
  date: string;
  blurb: string;
  leaders: string[];
  lotteryInfo: string;
}

function Td(props: { children: React.ReactNode }) {
  return (
    <td className="p-[0.7em] text-left text-[1.200rem]">{props.children}</td>
  );
}

function TripRow(data: Trip) {
  const getLotteryColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "signed up":
        return "bg-green-500 text-white";
      case "selected":
        return "bg-green-500 text-black";
      case "not selected":
        return "bg-orange-500 text-black";
      case "attended":
        return "bg-gray-500 text-white";
      case "no show":
        return "bg-gray-500 text-darkgray";
      case "hosted trip":
        return "bg-gray-300 text-black";
      default:
        return "bg-gray-300 text-darkgray";
    }
  };
  return (
    <tr className="divide-x divide-black px-4 py-2">
      <Td>
        <b>{data.tripName} </b>
        <br /> {data.blurb}
      </Td>
      <Td>{data.date}</Td>
      <Td>{data.leaders.join(", ")}</Td>
      <Td>
        <span
          className={`flex justify-center px-5 py-4 rounded ${getLotteryColor(
            data.lotteryInfo,
          )}`}
        >
          {data.lotteryInfo}
        </span>
      </Td>
    </tr>
  );
}

// create a table for all upcoming trips
function tripTable(tripsType: String, trips: Trip[]) {
  if (trips.length === 0) {
    return (
      <div className="flex flex-col mb-10 mx-10">
        <div className="border-b border-gray-700 border-radius w-[95%] mb-10 mx-auto">
          <div className="ml-4">
            <Subheading>{tripsType} Trips</Subheading>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col mb-10 mx-10">
      <div className="border-b border-gray-700 border-radius w-[95%] mb-10 mx-auto">
        <div className="ml-4">
          <Subheading>{tripsType} Trips</Subheading>
        </div>
      </div>
      <div className="flex justify-center">
        <table className="table-fixed w-full border border-black">
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <tbody className="divide-y divide-black">
            <tr className="divide-x divide-black px-4 py-2 text-center font-bold">
              <Td>Trip</Td>
              <Td>Date</Td>
              <Td>Leaders</Td>
              <Td>Lottery Info</Td>
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
  const [tripDetails, setTripDetails] = useState<Trip[]>([]);
  const [showPastTrips, setShowPastTrips] = useState(false);
  const [hostedTrips, setHostedTrips] = useState(false);

  const updateLogin = async () => {
    try {
      // User Profile information set
      const { data: userData } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/user/profile`,
        {
          headers: {
            token: localStorage.getItem("access_token"),
          },
        },
      );

      setUserProfile({
        name: `${userData.firstName} ${userData.lastName}`,
        role: `${userData.role} `,
        email: `${userData.email} `,
        phoneNum: `${userData.phone} `,
        tripsParticipated: `${userData.tripsParticipated} `,
      });
      if (userData.role === "Leader" || userData.role === "Admin") {
        setHostedTrips(true);
      }

      // User Trips information set
      const tripPromises = userData.TripSignUps.map(
        async (signup: TripSignUp) => {
          const { data: tripInfo } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE}/trip/${signup.tripId}`,
            {
              headers: {
                token: localStorage.getItem("access_token"),
              },
            },
          );

          const leaders =
            tripInfo.otherLeaders &&
            Array.isArray(tripInfo.otherLeaders) &&
            tripInfo.otherLeaders.length > 0
              ? tripInfo.otherLeaders
              : [];

          if (
            signup.tripRole === "Leader" &&
            !leaders.includes(`${userData.firstName} ${userData.lastName}`)
          ) {
            leaders.push(`${userData.firstName} ${userData.lastName}`);
          }

          return {
            tripId: signup.tripId,
            tripName: tripInfo.tripName || "Unknown",
            date: new Date(tripInfo.plannedDate).toLocaleDateString(),
            blurb: tripInfo.blurb || "No description",
            leaders: leaders.length > 0 ? leaders : ["No leaders assigned"],
            lotteryInfo: signup.status || "Hosted Trip",
          };
        },
      );
      const tripsWithDetails = await Promise.all(tripPromises);
      setTripDetails(tripsWithDetails);
    } catch (error) {
      console.error(error);
      setUserProfile({
        name: "",
        role: "",
        email: "",
        phoneNum: "",
        tripsParticipated: "",
      });
      setTripDetails([]);
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

      <br></br>
      <div id="content" className="flex justify-center items-start gap-20 p-14">
        <div className="relative w-60 aspect-square rounded-lg">
          <img
            alt="User Profile"
            className="absolute inset-0 rounded-lg "
            src={wood.src}
          />
          <img
            alt="User Profile"
            className="absolute inset-0 rounded-lg"
            src={profilepic.src}
          />
        </div>
        <div className="text-[1.200rem] text-boc_darkbrown leading-loose ">
          <div className="text-[3.3rem] leading-tight">
            <b>{userProfile.name}</b>
          </div>
          <div className="text-[2rem] mt-1">
            <b>{userProfile.role}</b>
          </div>
          <div className="flex gap-12 text-[1.2rem]">
            <div>
              <b>EMAIL</b>
              <p>{userProfile.email}</p>
            </div>
            <div>
              <b>PHONE NUMBER </b>
              <p>{userProfile.phoneNum}</p>
            </div>
          </div>
        </div>
        <div className="w-1/4 text-center rounded-lg float-right">
          <p className="text-2xl font-bold text-boc_darkbrown">SUMMIT SEEKER</p>

          <div className="relative w-full">
            <img
              src={tripsBadge.src}
              alt="trips badge"
              className="w-full h-auto p-7"
            ></img>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-5xl px-4 py-2 rounded-lg">
              {userProfile.tripsParticipated}
            </div>
          </div>
          <div className="pb-7">
            <p className="text-2xl font-bold text-boc_darkbrown">TOTAL TRIPS</p>
          </div>
        </div>
      </div>
      <br></br>
      {/* Your trips table */}
      {hostedTrips && (
        <div id="hostedTrips" className="flex flex-col mb-10">
          <button className="ml-auto mr-10 bg-boc_darkbrown text-white font-bold py-2 px-4 rounded-full hover:bg-boc_darkgreen transition duration-300 ease-in-out">
            + Create a New Trip
          </button>
          {tripTable(
            "Your",
            tripDetails.filter(
              (trip) =>
                trip.lotteryInfo === "Hosted Trip" &&
                new Date(trip.date).getTime() >= new Date().getTime(),
            ),
          )}
        </div>
      )}

      {/* Upcoming trips table */}
      {tripTable(
        "Upcoming",
        tripDetails.filter(
          (trip) =>
            trip.lotteryInfo !== "Hosted Trip" &&
            new Date(trip.date).getTime() >= new Date().getTime(),
        ),
      )}

      {/* Past trips table */}
      {showPastTrips && (
        <div id="pastTrips">
          {tripTable(
            "Past",
            tripDetails.filter(
              (trip) => new Date(trip.date).getTime() < new Date().getTime(),
            ),
          )}
        </div>
      )}
      <div className="flex justify-center">
        <button
          id="toggleButton"
          className="bg-boc_darkbrown text-white font-bold py-2 px-4 rounded-full hover:bg-boc_darkgreen transition duration-300 ease-in-out ml-auto mr-10 mb-10"
          onClick={() => setShowPastTrips(!showPastTrips)}
        >
          {showPastTrips ? "Hide Past Trips" : "Show Past Trips"}
        </button>
      </div>
    </div>
  );
}
