"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useState, useEffect } from "react";
import GreenButton from "@/components/GreenButton";
import NavBar from "@/components/NavBar";

function formatDate(isoDateString: string): string {
  const date = new Date(isoDateString);

  // Get month name
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];

  // Get day with ordinal suffix
  const day = date.getDate();
  const suffix = getDaySuffix(day);

  // Get year
  const year = date.getFullYear();

  return `${month} ${day}${suffix}, ${year}`;
}

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return "th";
  }

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [trip, setTrip] = useState<any>(null);
  const [signedUp, setSignedUp] = useState<any>(false);

  function signup() {
    axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/trip/${id}/signup`,
      {},
      {
        headers: {
          token: localStorage.getItem("access_token"),
        },
      },
    );
    setSignedUp(true);
  }

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE}/trip/${id}`, {
        headers: {
          token: localStorage.getItem("access_token"),
        },
      })
      .then((res) => {
        setTrip(res.data);
      });
    console.log(trip);
  }, [id]);

  const [role, setRole] = useState(""); // <-- create state for role

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE}/user/profile`, {
        headers: {
          token: localStorage.getItem("access_token"),
        },
      })
      .then((res) => {
        setRole(res.data.role); // <-- extract role from response
      });
  }, [id]);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE}/trip/${id}/is-signed-up`, {
        headers: {
          token: localStorage.getItem("access_token"),
        },
      })
      .then((res) => {
        setSignedUp(res.data);
      });
  }, [id]);

  switch (role) {
    case "admin":
      // Code to execute if role is 'admin'
      console.log("User is an admin");
      break;
    case "user":
      // Code to execute if role is 'user'
      console.log("User is a regular user");
      break;
    case "guest":
      // Code to execute if role is 'guest'
      console.log("User is a guest");
      break;
    default:
      // Code to execute if role doesn't match any case
      console.log("Unknown role");
      break;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Ensure NavBar is at the top */}
      <NavBar />

      {/* Main content section */}
      <div className="w-full px-14 py-6 flex flex-col gap-y-4">
        <div className="w-full">
          <h1 className="text-[4vmin] font-bold font-funky text-green">
            {trip?.tripName}
          </h1>
          <div className="w-full h-[1px] bg-black "></div>
        </div>
        <div className="w-full pt-4">
          <div className="flex flex-row gap-x-4">
            <div className="flex justify-around flex-col">
              <div className="flex flex-row gap-x-2">
                <label className="font-bold">Leaders:</label>
                <p>{trip?.leaders?.join(", ") || "No leaders assigned"}</p>
              </div>
              <div className="flex flex-row gap-x-2">
                <label className="font-bold">Trip Category:</label>
                <p>{trip?.category || "Not specified"}</p>
              </div>
              <div className="flex flex-row gap-x-2">
                <label className="font-bold">Date:</label>
                <p>
                  {trip?.plannedDate
                    ? formatDate(trip?.plannedDate)
                    : "Date not set"}
                </p>
              </div>
              <div className="flex flex-row gap-x-2">
                <label className="font-bold">Qualifications:</label>
                <p>{trip?.qualifications?.join(", ") || "None required"}</p>
              </div>
            </div>
          </div>
          <p className="text-[2vmin] pt-4 pb-4">{trip?.sentenceDesc}</p>
        </div>
        <div>
          <h2 className="text-[2.5vmin] font-bold">Signup Information</h2>
          <div className="mt-4">
            <div className="flex flex-row gap-x-2 items-center">
              <label className="text-md">Signups Opened At:</label>
              <p className="text-sm">
                {trip?.createdAt ? formatDate(trip?.createdAt) : "Not set"}
              </p>
            </div>
            <div className="flex flex-row gap-x-2 items-center">
              <label className="text-md">Signups Close At:</label>
              <p className="text-sm">
                {trip?.signupClose ? formatDate(trip?.signupClose) : "Not set"}
              </p>
            </div>
            <div className="flex flex-row gap-x-2 items-center">
              <label className="text-md">Maximum Participants:</label>
              <p className="text-sm">
                {trip?.maxSize ? trip?.maxSize : "Not set"}
              </p>
            </div>
            <div className="flex flex-row gap-x-2 items-center">
              <label className="text-md">Notes:</label>
              <p className="text-sm">
                {trip?.notes ? trip?.notes : "No notes"}
              </p>
            </div>
          </div>
        </div>
        <div className="w-fit">
          {signedUp ? (
            <div>You are signed up!</div>
          ) : (
            <GreenButton
              text="Signup for this trip!"
              onClick={() => signup()}
            ></GreenButton>
          )}
        </div>
        {trip?.status.toLowerCase() === "open" ? (
          <div className="mt-2 p-4 bg-[#D9EDF7] border border-blue-200 rounded-lg">
            <p className="text-blue-600">
              Signups are currently open for this trip!
            </p>
          </div>
        ) : (
          <div className="mt-2 p-4 bg-[#F2DEDE] border border-red-200 rounded-lg">
            <p className="text-red-600">
              In order to signup for this trip, you must be{" "}
              <Link href="/" className="text-blue-600">
                logged in
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
