import { TripWithSignup, TripRole } from "@/models/models";
import { Requesters } from "@/scripts/requests";

import Login from "@/components/Login";
import BOCButton from "@/components/BOCButton";
import TripInfoBar from "./TripInfoBar";

export default function TripPageContents({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  const { backendPost } = reqs;
  const role = ( trip.userData ? trip.userData.tripRole : TripRole.None );

  function signup() {
    backendPost(`/trip/${trip.id}/signup`, {});
    window.location.reload(); 
  }
  console.log(trip)
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="w-full px-14 py-6 flex flex-col gap-y-4">
        <div className="w-full">
          <h1 className="text-[4vmin] font-bold font-funky text-boc_green">
            {trip?.tripName}
          </h1>
          <div className="w-full h-[1px] bg-gray-400"></div>
        </div>
        {/* Image and Trip Info */}
        <TripInfoBar trip={trip}/>
        {/* Signup Button */}
        {trip?.status.toLowerCase() != "open" ? (
          <div className="mt-2 p-4 bg-gray-200 border border-grey-400 rounded-lg">
            <p className="text-grey-600">Signups have closed.</p>
          </div>
        ) : (
          <div>
            {role == TripRole.None ? (
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
                  {true ? (
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