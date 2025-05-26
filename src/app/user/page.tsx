"use client";
import React, { useEffect, useRef, useState } from "react";

import tripsBadge from "@/assets/images/profile/badge.png";
import profilepic from "@/assets/images/profile/bear.png";
import wood from "@/assets/images/profile/wood.png";

import { useSession } from "next-auth/react";
import api from "@/scripts/api";

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
    <td className="border-boc_green rounded-lg p-[5px] text-left text-boc_darkbrown border-2">
      {props.children}
    </td>
  );
}

function Th(props: { children: React.ReactNode }) {
  return (
    <th
      className="border-boc_green rounded-t-lg p-[5px] bg-green-100 
    text-center text-boc_darkbrown border-2"
    >
      {props.children}
    </th>
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
    <tr className="px-4 py-2">
      <Td>
        <b className="text-blue-400">{data.tripName} </b>
        <br /> {data.blurb}
      </Td>
      <Td>
        <div className="text-center w-full">{data.date}</div>
      </Td>
      <Td>
        <span
          className={`flex justify-center items-center h-[50px] rounded ${getLotteryColor(
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
  return (
    <div className="flex flex-col pb-10">
      <h1 className="text-2xl font-bold font-funky text-boc_darkgreen">
        {tripsType} Trips
      </h1>

      <div className="flex justify-center py-5">
        <table className="table-fixed w-full border-separate border-spacing-2">
          <colgroup>
            <col style={{ width: "60%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <tbody>
            <tr className="px-4 py-2 text-center font-bold">
              <Th>Trip Title</Th>
              <Th>Date</Th>
              <Th>Lottery Info</Th>
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
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [phone, setPhone] = useState("");

  const { data: session, status } = useSession();

  const updateLogin = async () => {
    try {
      // User Profile information set
      const { data: userData } = await api.get("/user/profile", {
        headers: { token: session.jwt.accessToken },
      });
      setUserProfile(userData);
      if (userData.role === "Leader" || userData.role === "Admin") {
        setHostedTrips(true);
      }

      // User Trips information set
      const tripPromises = userData.TripSignUps.map(
        async (signup: TripSignUp) => {
          const { data: tripInfo } = await api.get(`/trip/${signup.tripId}`, {
            headers: {
              token: session.jwt.accessToken,
            },
          });

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
      setLoading(false);
    } catch (error) {
      console.error(error);
      setUserProfile({});
      setTripDetails([]);
      console.log("ERROR");
      setLoading(false);
    }
  };

  const submitPhone = async () => {
    const response = await api.post(
      "/user/add-phone",
      { phoneNum: phone },
      {
        headers: {
          token: session.jwt.accessToken,
        },
      },
    );
  };

  useEffect(() => {
    if (status !== "loading") {
      updateLogin();
    }
  }, [status]);

  if (loading) {
    return <div className="px-20 flex justify-center">Loading...</div>;
  }

  return (
    <div className="h-full min-h-screen w-full px-40 py-10">
      {showPhone ? (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-200 p-5">
            Set Phone Number:{" "}
            <input onChange={(e) => setPhone(e.target.value)} />
            <div className="flex space-x-5 justify-center items-end">
              <button onClick={() => setShowPhone(false)}>Cancel</button>
              <button onClick={() => submitPhone()}>Submit</button>
            </div>
          </div>
        </div>
      ) : null}
      {/* Site content */}

      <div id="content" className="flex justify-between items-start">
        <div className="relative w-60 aspect-square rounded-lg">
          <img
            alt="User Profile"
            className="inset-0 rounded-lg"
            src={wood.src}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              alt="User Profile"
              className="inset-0 rounded-lg h-[50%]"
              src={profilepic.src}
            />
          </div>
        </div>
        <div className="text-[1.200rem] text-boc_darkbrown leading-loose ">
          <div className="text-[3.3rem] leading-tight">
            <b>
              {userProfile.firstName} {userProfile.lastName}
            </b>
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
              <b>PHONE NUMBER</b>
              <div
                onClick={() => setShowPhone(true)}
                className="cursor-pointer"
              >
                <u>{userProfile.phone ? userProfile.phone : "Set phone"}</u>
              </div>
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
        <div>
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
          className="bg-boc_darkbrown text-white font-bold py-2 px-4 rounded-full hover:bg-boc_darkgreen transition duration-300 ease-in-out"
          onClick={() => setShowPastTrips(!showPastTrips)}
        >
          {showPastTrips ? "Hide Past Trips" : "Show Past Trips"}
        </button>
      </div>
    </div>
  );
}
