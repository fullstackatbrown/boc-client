"use client";
import React, { useEffect, useState } from "react";

import { useSession } from "next-auth/react";
import { makeRequesters }from "@/scripts/requests"
import { User, TripSignUp } from "@/models/models"
import ProfileBar from "./ProfileBar";

interface Trip { //Different from the Trip interface in models.tsx 
  tripId: number;
  tripName: string;
  date: string;
  sentenceDesc: string;
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
    <tr 
    className="px-4 py-2"
    onClick={()=>{
      window.location.href = `/trips/view?id=${data.tripId}`
    }}
    >
      <Td>
        <b className="text-blue-400">{data.tripName} </b>
        <br /> {data.sentenceDesc}
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
    <div className="flex flex-col mb-10">
      <h1 className="text-2xl font-bold font-funky text-boc_darkgreen">
        {tripsType} Trips
      </h1>

      <div className="flex justify-center pt-5">
        { trips.length > 0 ? 
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
              { trips.map((data, index) => (
                <TripRow key={index} {...data} />
              ))}
            </tbody>
          </table>
          : <p className="w-full text-center border-2 border-dashed border-boc_green rounded-lg p-8 text-2xl text-gray-500">None Yet!</p>
        }
      </div>
    </div>
  );
}

export default function Profile() {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [tripDetails, setTripDetails] = useState<Trip[]>([]);
  const [showPastTrips, setShowPastTrips] = useState(false);
  const [hostedTrips, setHostedTrips] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [showPhone, setShowPhone] = useState(false);
  // const [phone, setPhone] = useState("");

  const { backendGet, backendPost } = makeRequesters();
  const { data: session, status } = useSession();

  const updateLogin = async () => {
    try {
      // User Profile information set
      const { data: userData } = await backendGet("/user/profile")
      setUserProfile(userData);
      if (userData.role === "Leader" || userData.role === "Admin") {
        setHostedTrips(true);
      }

      // User Trips information set
      const tripPromises = userData.TripSignUps.map(
        async (signup: TripSignUp): Promise<Trip> => {
          const { data: tripInfo } = await backendGet(`/trip/${signup.tripId}`);

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
            sentenceDesc: tripInfo.sentenceDesc || "No description",
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
      setUserProfile(null);
      setTripDetails([]);
      setLoading(false);
    }
  };

  const submitPhone = (newPhone: string) => {
    return backendPost("/user/add-phone", { phoneNum: newPhone })
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
      <ProfileBar userProfile={userProfile!} submitPhone={submitPhone}/>
      <br/>
      {/* Your trips table */}
      {hostedTrips && (
        <div id="hostedTrips" className="flex flex-col">
          <button 
            className="ml-auto mr-10 bg-boc_darkbrown text-white font-bold py-2 px-4 rounded-full hover:bg-boc_darkgreen transition duration-300 ease-in-out"
            onClick={() => {
              window.location.href = "/trips/creation-form";
            }}
          >
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
