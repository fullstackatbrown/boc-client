"use client";
import React, { useEffect, useState } from "react";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRequesters }from "@/scripts/requests"
import { User, TripSignUp } from "@/models/models"
import { formatDateString } from "@/utils/utils"
import ProfileBar from "./ProfileBar";

interface Trip { //Different from the Trip interface in models.tsx 
  tripId: number;
  tripName: string;
  date: string;
  sentenceDesc: string;
  leaders: string[];
  lotteryInfo: string;
}

function Td(props: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`block sm:table-cell border-boc_green rounded-lg p-[5px] text-left
    text-boc_darkbrown border-2 ${props.className ?? ""}`}>
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

function TripRow(data: Trip & { onOpen: (tripId: number) => void }) {
  const getLotteryColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "signed up":
        return "bg-green-500 text-white";
      case "selected":
        return "bg-green-500 text-black";
      case "waitlisted":
        return "bg-blue-500 text-black";
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
    //Below sm the row is a card: title/blurb across the top, date and status sharing the
    //line beneath. It stays one <tr>, so the whole card remains a single click target.
    <tr
    className="flex flex-wrap gap-2 mb-4 sm:table-row sm:mb-0 px-4 py-2 cursor-pointer"
    onClick={() => data.onOpen(data.tripId)}
    >
      <Td className="w-full">
        <b className="text-blue-400">{data.tripName} </b>
        <br /> {data.sentenceDesc}
      </Td>
      <Td className="flex-1">
        <div className="text-center w-full">{data.date}</div>
      </Td>
      <Td className="flex-1">
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
function tripTable(tripsType: String, trips: Trip[], onOpen: (tripId: number) => void) {
  return (
    <div className="flex flex-col mb-10">
      <h1 className="text-2xl font-bold font-funky text-boc_darkgreen">
        {tripsType} Trips
      </h1>

      <div className="flex justify-center pt-5">
        { trips.length > 0 ? 
          <table className="block sm:table table-fixed w-full border-separate border-spacing-2">
            <colgroup>
              <col style={{ width: "60%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <tbody className="block sm:table-row-group">
              {/* The cards below sm label themselves, so the header only exists as a table */}
              <tr className="hidden sm:table-row px-4 py-2 text-center font-bold">
                <Th>Trip Title</Th>
                <Th>Date</Th>
                <Th>Lottery Info</Th>
              </tr>
              { trips.map((data) => (
                <TripRow key={data.tripId} {...data} onOpen={onOpen} />
              ))}
            </tbody>
          </table>
          : <p className="w-full text-center border-2 border-dashed border-boc_green rounded-lg p-6 sm:p-8 text-xl sm:text-2xl text-gray-500">None Yet!</p>
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

  const { backendGet, backendPost } = useRequesters();
  const { status } = useSession();
  const router = useRouter();
  const openTrip = (tripId: number) => router.push(`/trips/view?id=${tripId}`);

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
            date: formatDateString(tripInfo.plannedDate),
            sentenceDesc: tripInfo.sentenceDesc || "No description",
            leaders: leaders.length > 0 ? leaders : ["No leaders assigned"],
            lotteryInfo: signup.status || "Hosted Trip",
          };
        },
      );
      const tripsWithDetails = await Promise.all(tripPromises);
      setTripDetails(tripsWithDetails);
      setLoading(false);
    } catch (error: any) {
      //There is no profile to show without a session, so send them to log in and come back
      if (error?.status === 401) {
        signIn("google", { callbackUrl: "/user" });
        return;
      }
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
    //backendGet is stable across renders (see useRequesters) - including it just means
    //the profile refetches if the session changes, which is what we want
  }, [status, backendGet]);

  if (loading) {
    return <div className="px-6 sm:px-10 desktop:px-20 flex justify-center">Loading...</div>;
  }
  //Without this, a failed fetch renders ProfileBar with a null profile and throws
  if (!userProfile) {
    return (
      <div className="px-6 sm:px-10 desktop:px-20 flex justify-center text-center">
        We couldn't load your profile. Try refreshing, and let an admin know if it keeps happening.
      </div>
    );
  }

  return (
    <div className="h-full min-h-screen w-full px-6 sm:px-10 desktop:px-40 py-10">
      <ProfileBar userProfile={userProfile} submitPhone={submitPhone}/>
      <br/>
      {/* Your trips table */}
      {hostedTrips && (
        <div id="hostedTrips" className="flex flex-col">
          <button 
            className="ml-auto mr-0 desktop:mr-10 whitespace-nowrap bg-boc_darkbrown text-white font-bold py-2 px-4 rounded-full hover:bg-boc_darkgreen transition duration-300 ease-in-out"
            onClick={() => router.push("/trips/creation-form")}
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
            openTrip,
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
        openTrip,
      )}

      {/* Past trips table */}
      {showPastTrips && (
        <div>
          {tripTable(
            "Past",
            tripDetails.filter(
              (trip) => new Date(trip.date).getTime() < new Date().getTime(),
            ),
            openTrip,
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
