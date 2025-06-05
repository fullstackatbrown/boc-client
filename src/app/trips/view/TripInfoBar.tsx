import { TripWithSignup, SimpleUser } from "@/models/models";
import pizzaAlan from "@/assets/images/trips/pizza-alan.jpeg"

export default function TripInfoBar({ trip }:{ trip: TripWithSignup }) {
  return (
    <div className="w-full pt-4">
      <div className="flex flex-row gap-x-4">
        {/* <div className="w-1 h-auto bg-cover" style={{ backgroundImage: `url(${pizzaAlanPath})` }}></div> */}
        <img src={pizzaAlan.src} className="w-auto h-72 object-cover"/>
        <div className="flex justify-around flex-col">
          <div className="flex flex-row gap-x-2">
          <label className="font-bold">Leaders:</label>
          <p>{trip.leaders.map((leader: SimpleUser) => `${leader.firstName} ${leader.lastName}`).join(", ") || "No leaders assigned"}</p>
          </div>
          <div className="flex flex-row gap-x-2">
          <label className="font-bold">Trip Category:</label>
          <p>{trip.category || "Not specified"}</p>
          </div>
          <div className="flex flex-row gap-x-2">
          <label className="font-bold">Date:</label>
          <p>
              {trip.plannedDate
              ? new Date(trip.plannedDate).toLocaleDateString()
              : "Date not set"}
          </p>
          </div>
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
      <p className="text-[2vmin] pt-4 pb-4">{trip.sentenceDesc}</p>
    </div>
  )
}