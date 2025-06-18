import { TripWithSignup, TripRole, TripStatus, SignupStatus } from "@/models/models";
import BOCButton from "@/components/BOCButton";
import { Requesters } from "@/scripts/requests";

function Message({ text, bgColor, textColor}: { text: string, bgColor: string, textColor: string }) {
  return (
    <div className={`p-4 rounded-lg ${bgColor} flex-grow`}>
      <p className={`line-clamp-2 overflow-scroll ${textColor}`}>{text}</p>
    </div>
  )
}

// function Informational({ text }:{ text: string }) {
//   return (
//     <div className="p-4 bg-gray-200 border border-grey-400 rounded-lg overflow-scroll">
//       <p className="text-grey-600">{text}</p>
//     </div>
//   )
// }
function Informational({ text }:{ text: string }) { return <Message text={text} bgColor="bg-gray-200" textColor="text-gray-600"/> }
function BadNews({ text }: { text: string }) { return <Message text={text} bgColor="bg-red-200" textColor="text-red-600"/> }
function GoodNews({ text }: { text: string }) { return <Message text={text} bgColor="bg-boc_lightgreen" textColor="text-boc_darkgreen"/> }

export default function SignupButton({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  //Signup/confirm/cancel functionality
  const { backendPost } = reqs;
  function signup() {
    backendPost(`/trip/${trip.id}/signup`, {});
    window.location.reload(); 
  }
  function confirm() {
    backendPost(`/trip/${trip.id}/participate/confirm`, {});
    //window.location.reload();
  }
  function cancel() {

  }
  //Possible components
  const SignupsClosed = <Informational text="Signups have closed"/>
  const Staging = <Informational text="This trip is not yet public" />
  const SignUpButton = (
    <div className="w-full flex justify-center gap-4 items-end">
      <div className="flex-shrink-0">
        <BOCButton
          text="Signup for this trip!"
          onClick={() => signup()}
        ></BOCButton>
      </div>
      <Informational text="Signups usually close 3-4 days before the trip date." />
    </div>
  )
  const SignedUp = <Informational text="You are signed up! We'll let you know once the lottery has run if you were selected. You are signed up! We'll let you know once the lottery has run if you were selected." />
  const NotSelected = <BadNews text="Unfortunately, you were not selected for this trip."/>
  const Selected = ( 
    <div className="flex gap-2">
      <div className="flex flex-col gap-1 w-1/4 flex-shrink-0">
        <BOCButton text="Confirm" onClick={() => confirm()}></BOCButton>
        <BOCButton text="Cancel" onClick={() => cancel()} negative></BOCButton>
      </div>
      <GoodNews text="Congrats, you were selected! Now, confirm your spot so we know you're still interested." />
    </div>
  )
  const Confirmed = <GoodNews text="Thanks for confirming your spot!" />
  const Attended = <GoodNews text="Thanks for exploring with us!" />
  const NoShow = <BadNews text="You were recorded as a no show." />

  //Return based on trip role and trip status
  const role = ( trip.userData ? trip.userData.tripRole : TripRole.None );
  let content;
  if (role == TripRole.Participant) {
    switch (trip.userData!.status) {
      case SignupStatus.SignedUp:
        content = SignedUp
        break;
      case SignupStatus.NotSelected:
        content = NotSelected
        break;
      case SignupStatus.Selected:
        if (trip.userData!.confirmed) content = Confirmed
        else content = Selected
        break;
      case SignupStatus.Attended:
        content = Attended
        break;
      case SignupStatus.NoShow:
        content = NoShow
        break;
    }
  }
  else if (trip.status == TripStatus.Staging) content = Staging;
  else { //Leaders and non-participants see the same things
    if (trip.status == TripStatus.Open) content = SignUpButton
    else content = SignupsClosed
  }
  return (
    <div className="flex-grow">
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