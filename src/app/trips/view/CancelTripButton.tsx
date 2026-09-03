"use client"

import { SignupStatus, TripParticipant, TripStatus, TripWithSignup } from "@/models/models";
import { Requesters } from "@/scripts/requests";
import Popup from "@/components/Popup";
import { useState } from "react";

//Cancellation is only offered before the trip has happened - the backend rejects it
//from Post-Trip onwards, and this keeps the button off the page entirely.
const CANCELLABLE = [TripStatus.Staging, TripStatus.Open, TripStatus.PreTrip];

//Who the backend will delete and mail: everyone signed up while Open, but only the
//people still on the trip once the lottery has run.
function affected(trip: TripWithSignup, participants: TripParticipant[]) {
  if (trip.status != TripStatus.PreTrip) return participants.length;
  return participants.filter((p) =>
    [SignupStatus.Selected, SignupStatus.Waitlisted].includes(p.status)
  ).length;
}

export default function CancelTripButton({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  const { backendGet, backendPost } = reqs;
  const [popup, setPopup] = useState(false);
  //null until the count arrives, so the dialog never claims a number it doesn't have
  const [count, setCount] = useState<number | null>(null);

  if (!CANCELLABLE.includes(trip.status)) return <></>;

  const openPopup = () => {
    setPopup(true);
    backendGet(`/trip/${trip.id}/lead/participants`)
      .then((res) => setCount(affected(trip, res.data)))
      .catch(() => setCount(null)); //Not worth an alert; the dialog just stays vague
  };

  const cancelTrip = () => {
    backendPost(`/trip/${trip.id}/lead/cancel`, {})
      //Not a reload: the trip no longer exists, so the page would 404 at itself
      .then(() => { window.location.href = "/trips" })
      .catch((err) => {
        switch (err.status) {
          case (403):
          case (422):
            alert(`The backend didn't like what you just tried to do. Here's what it had to say about it: ${err.response.data.errMessage}`);
            break;
          case (404):
            //A frontend deployed ahead of the backend has no route to call yet
            alert("Trip cancellation isn't available on the server yet. Contact the website's admin.");
            break;
          default:
            alert(`ERROR. You shouldn't be seeing this! Contact the website's admin and send them a picture of this message! ${err}`);
            console.log(err);
            break;
        }
        setPopup(false);
      })
  };

  const blastRadius = count === null
    ? "Everyone signed up will be emailed."
    : `${count} ${count == 1 ? "person" : "people"} will be removed from the trip and emailed.`;

  return (
    <>
      {/*Centred and only as wide as its text: the status bar's stages are full-width
         rows on mobile, so a full-width red button would read as another stage. mt-4
         doubles the column gap to keep it clear of the "Next" control without a rule.*/}
      <button
        className="self-center mt-4 w-auto px-8 py-3 rounded-xl border-4 border-red-700 text-red-700 text-center transition ease-in hover:bg-red-700 hover:text-white"
        onClick={openPopup}
      >
        Cancel Trip
      </button>
      { popup
        ? <Popup onClose={()=>{setPopup(false)}}>
            <div className="max-w-sm flex flex-col gap-3">
              <p className="font-funky text-xl text-red-700">Cancel {trip.tripName}?</p>
              <p>
                This permanently deletes the trip and every signup on it. {blastRadius} This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  className="w-1/2 py-2 rounded-xl border-4 border-boc_medbrown"
                  onClick={()=>{setPopup(false)}}
                >
                  Keep Trip
                </button>
                <button
                  className="w-1/2 py-2 rounded-xl border-4 border-red-700 bg-red-700 text-white transition ease-in hover:bg-red-800 hover:border-red-800"
                  onClick={cancelTrip}
                >
                  Cancel Trip
                </button>
              </div>
            </div>
          </Popup>
        : <></>
      }
    </>
  )
}
