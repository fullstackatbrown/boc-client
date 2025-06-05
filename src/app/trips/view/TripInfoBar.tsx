import { TripWithSignup, SimpleUser } from "@/models/models";
import pizzaAlan from "@/assets/images/trips/pizza-alan.jpeg"
import SignupButton from "./SignupButton";
import { Requesters } from "@/scripts/requests";

function classToCost(cls: string): number | undefined {
  const mapping: Record<string, number> = { //Thanks Chat
    A: 5,
    B: 10,
    C: 15,
    D: 20,
    E: 25,
    F: 30,
    G: 35,
    H: 40,
    I: 45,
    J: 50,
    Z: 0
  };
  return mapping[cls];
}

function TripInfo({ lead, text }:{ lead: string, text: string }) {
  return (
    <div className="mb-1">
      <p><span className="font-bold mr-2">{lead}:</span>{text}</p>
    </div>
  )
}

export default function TripInfoBar({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  const cost = (trip.class ? classToCost(trip.class) : trip.priceOverride! )
  return (
    <div className="w-full pt-4">
      <div className="flex flex-row gap-x-4">
        <img src={pizzaAlan.src} className="w-96 h-80 object-cover rounded-2xl"/>
        <div className="flex-grow">
          <div className="w-full bg-boc_lightgreen rounded-2xl pt-4 pb-8 px-10">
            <h2 className="w-full text-center text-boc_green font-funky text-3xl mb-3">Trip Info</h2>
            <div className="flex justify-around flex-col">
              <TripInfo lead="Leaders" text={trip.leaders.map((leader: SimpleUser) => `${leader.firstName} ${leader.lastName}`).join(", ") || "No leaders assigned"} />
              <TripInfo lead="Trip Category" text={trip.category || "Not specified"}/>
              <TripInfo lead="Date" text={trip.plannedDate ? new Date(trip.plannedDate).toLocaleDateString() : "Date not set"}/>
              <TripInfo lead="Cost" text={cost == 0 ? "Free!" : "$"+String(cost)} />
              {/* <div className="flex flex-row gap-x-2">
              <label className="font-bold">Qualifications:</label>
              <p>{trip?.qualifications?.join(", ") || "None required"}</p>
              </div> */}
              {/* <div className="flex flex-row gap-x-2">
              <label className="font-bold">Signup Deadline:</label>
              <p>
                  {trip?.signupClose
                  ? formatDate(trip?.signupClose)
                  : "Not set"}
              </p>
              </div> */}
            </div>
          </div>
          <SignupButton trip={trip} reqs={reqs}/>
        </div>
      </div>
      <p className="text-[2vmin] pt-4 pb-4">{trip.sentenceDesc}</p>
    </div>
  )
}