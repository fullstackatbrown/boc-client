import { TripWithSignup, TripRole } from "@/models/models";
import { Requesters } from "@/scripts/requests";

import Title from "@/components/Title";
import TripInfoBar from "./TripInfoBar";

export default function TripPageContents({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="w-full px-14 flex flex-col gap-y-4">
        <Title text={trip.tripName}/>
        <main className="px-[min(13rem,20%)]">
          <TripInfoBar trip={trip} reqs={reqs}/>
          <p>{trip.blurb}</p>
        </main>
      </div>
    </div>
  );
}