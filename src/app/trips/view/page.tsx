"use client";

import Login from "@/components/Login";
import BOCButton from "@/components/BOCButton";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import api from "@/scripts/api";
import { useSession } from "next-auth/react";

export default function TripPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [trip, setTrip] = useState<any>(null);
  const [signedUp, setSignedUp] = useState<any>(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: session, status } = useSession();

  function signup() {
    let token = localStorage.getItem("access_token");
    api.post(
      `/trip/${id}/signup`,
      {},
      {
        headers: {
          token: session.accessToken,
        },
      },
    );
    setSignedUp(true);
  }

  useEffect(() => {
    if (status !== "loading") {
      api
        .get(`/trip/${id}`, {
          headers: {
            token: session.accessToken,
          },
        })
        .then((res) => {
          setTrip(res.data);
          if (res.data.userData == null) {
            // Not signed in
            setRole(null);
          } else if (res.data.userData == -1) {
            // Signed in but not signed up
            setRole("None");
          } else {
            // Signed in and signed up
            setRole(res.data.userData.tripRole);
            setSignedUp(true);
          }

          setLoading(false);
        });
    }
  }, [id, status]);

  if (loading) {
    return <div className="px-20 flex justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content section */}
      <div className="w-full px-14 py-6 flex flex-col gap-y-4">
        <div className="w-full">
          <h1 className="text-[4vmin] font-bold font-funky text-boc_green">
            {trip?.tripName}
          </h1>
          <div className="w-full h-[1px] bg-gray-400"></div>
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
                    ? new Date(trip.plannedDate).toLocaleDateString()
                    : "Date not set"}
                </p>
              </div>
              <div className="flex flex-row gap-x-2">
                <label className="font-bold">Qualifications:</label>
                <p>{trip?.qualifications?.join(", ") || "None required"}</p>
              </div>
              <div className="flex flex-row gap-x-2">
                <label className="font-bold">Signup Deadline:</label>
                <p>
                  {trip?.signupClose
                    ? formatDate(trip?.signupClose)
                    : "Not set"}
                </p>
              </div>
            </div>
          </div>
          <p className="text-[2vmin] pt-4 pb-4">{trip?.sentenceDesc}</p>
        </div>

        {trip?.status.toLowerCase() != "open" ? (
          <div className="mt-2 p-4 bg-gray-200 border border-grey-400 rounded-lg">
            <p className="text-grey-600">Signups have closed.</p>
          </div>
        ) : (
          <div>
            {role == null ? (
              <div className="mt-2 p-4 bg-[#F2DEDE] border border-red-200 rounded-lg">
                <p className="text-red-600">
                  In order to signup for this trip, you must be{" "}
                  <Login>
                    <u>logged in</u>
                  </Login>
                  .
                </p>
              </div>
            ) : (
              <div>
                <div className="w-fit">
                  {signedUp ? (
                    <div>You are signed up!</div>
                  ) : (
                    <div>
                      <BOCButton
                        text="Signup for this trip!"
                        onClick={() => signup()}
                      ></BOCButton>
                      <div className="mt-2 p-4 bg-[#D9EDF7] border border-blue-200 rounded-lg">
                        <p className="text-blue-600">Signups are now open!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
