import { TripWithSignup, TripRole, TripStatus } from "@/models/models";
import BOCButton from "@/components/BOCButton";
import { Requesters } from "@/scripts/requests";

function Informational({ text }:{ text: string }) {
  return (
    <div className="p-4 bg-gray-200 border border-grey-400 rounded-lg overflow-scroll">
      <p className="text-grey-600">{text}</p>
    </div>
  )
}

export default function SignupButton({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  //Signup functionality
  const { backendPost } = reqs;
  function signup() {
    backendPost(`/trip/${trip.id}/signup`, {});
    window.location.reload(); 
  }
  //Possible components
  const SignupsClosed = <Informational text="Signups have closed"/>
  const SignedUp = (
    <div>You are signed up!</div>
  )
  const Staging = (
    <div>This trip is not yet public.</div>
  )
  const SignUpButton = (
    <div className="w-full flex justify-center gap-4">
      <div className="flex-shrink-0">
        <BOCButton
          text="Signup for this trip!"
          onClick={() => signup()}
        ></BOCButton>
      </div>
      <Informational text="Signups usually close 2-3 days before the trip date." />
    </div>
  )
  //Return based on trip role and trip status
  const role = ( trip.userData ? trip.userData.tripRole : TripRole.None );
  let content;
  if (role == TripRole.Participant) content = SignedUp
  else if (trip.status == TripStatus.Staging) content = Staging;
  else { //Leaders and non-participants see the same things
    if (trip.status == TripStatus.Open) content = SignUpButton
    else content = SignupsClosed
  }
  return (
    <div className="py-4">
      {content}
    </div>
  )
    // <>
    //   {trip?.status.toLowerCase() != "open" ? (
    //     <div className="mt-2 p-4 bg-gray-200 border border-grey-400 rounded-lg">
    //       <p className="text-grey-600">Signups have closed.</p>
    //     </div>
    //   ) : (
    //     <div>
    //       {role == TripRole.None ? (
    //         <div className="mt-2 p-4 bg-[#F2DEDE] border border-red-200 rounded-lg">
    //           <p className="text-red-600">
    //             In order to signup for this trip, you must be{" "}
    //             <Login>
    //               <u>logged in</u>
    //             </Login>
    //             .
    //           </p>
    //         </div>
    //       ) : (
    //         <div>
    //           <div className="w-fit">
    //             {true ? (
    //               <div>You are signed up!</div>
    //             ) : (
    //               <div>
    //                 <BOCButton
    //                   text="Signup for this trip!"
    //                   onClick={() => signup()}
    //                 ></BOCButton>
    //                 <div className="mt-2 p-4 bg-[#D9EDF7] border border-blue-200 rounded-lg">
    //                   <p className="text-blue-600">Signups are now open!</p>
    //                 </div>
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   )}
    // </>
}