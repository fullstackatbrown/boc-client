'use client'

import { useState } from "react";
import { TripWithSignup, TripRole, TripStatus, SignupStatus, TripClass } from "@/models/models";
import BOCButton from "@/components/BOCButton";
import { AuthStat, Requesters } from "@/scripts/requests";
import Popup from "@/components/Popup";
import { signIn } from "next-auth/react";

function Message({ text, bgColor, textColor}: { text: string, bgColor: string, textColor: string }) {
  return (
    <div className={`p-4 rounded-lg ${bgColor}`}>
      <p className={`line-clamp-2 overflow-scroll ${textColor}`}>{text}</p>
    </div>
  )
}

function Informational({ text }:{ text: string }) { return <Message text={text} bgColor="bg-gray-200" textColor="text-gray-600"/> }
function BadNews({ text }: { text: string }) { return <Message text={text} bgColor="bg-red-200" textColor="text-red-600"/> }
function GoodNews({ text }: { text: string }) { return <Message text={text} bgColor="bg-boc_lightgreen" textColor="text-boc_darkgreen"/> }

export default function SignupButton({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  //Signup/confirm/cancel functionality
  const { backendPost, sessionStatus } = reqs;
  async function simpleUpdate(path: string) {
    let stat = await sessionStatus()
    if (stat != AuthStat.Auth) { //Users may not be signed in
      await signIn();
    }
    await backendPost(path, {});
    window.location.reload(); 
  }
  const [showPopup, setShowPopup] = useState(false);
  //Helper Components
  const payBar = ( 
    <div className="flex flex-col gap-1 flex-shrink-0">
      <BOCButton text="Pay" onClick={async () => { 
        await backendPost(`/trip/${trip.id}/participate/pay`, {});
        window.open("https://payment.brown.edu/C20460_ustores/web/store_cat.jsp?STOREID=2&CATID=396", "_blank");
        window.location.reload();
      }} grow/>
      <a href="/about/financial-aid" className="text-sm underline nowrap">Financial Aid Policy</a> 
    </div>
  )
  //Possible components
  const Staging = <Informational text="This trip is not yet public" />
  const SignUpButton = (
    <div className="w-full flex flex-col gap-2 justify-stretch items-stretch">
      <Informational text="Signups usually close 3-4 days before the trip date." />
      <BOCButton
        text="Sign up for this trip!"
        onClick={() => simpleUpdate(`/trip/${trip.id}/signup`)}
      ></BOCButton>
    </div>
  )
  const SignupsClosed = <Informational text="Signups have closed"/>
  const SignedUp = <Informational text="You are signed up! We'll let you know once the lottery has run if you were selected." />
  const NotSelected = <BadNews text="Unfortunately, you were not selected for this trip. Your odds of getting on a future trip are now increased!"/>
  const Selected = ( 
    <div className="flex gap-2">
      <div className="flex flex-col gap-1 w-1/4 flex-shrink-0">
        <BOCButton text="Confirm" onClick={() => simpleUpdate(`/trip/${trip.id}/participate/confirm`)}></BOCButton>
        <BOCButton text="Cancel" onClick={() => setShowPopup(true)} negative></BOCButton>
      </div>
      <GoodNews text="Congrats, you were selected! Now, confirm your spot so we know you're still interested." />
    </div>
  )
  const Waitlisted = ( 
    <div className="flex gap-2">
      <div className="flex flex-col gap-1 w-1/4 flex-shrink-0">
        <BOCButton text="Confirm" onClick={() => simpleUpdate(`/trip/${trip.id}/participate/confirm`)}></BOCButton>
        <BOCButton text="Cancel" onClick={() => setShowPopup(true)} negative></BOCButton>
      </div>
      <Informational text="You are currently on the waitlist. Confirm your interest now to jump to the top of the waitlist!"/>
    </div>
  )
  const WaitlistedConfrimed = <Informational text="Thanks for confirming your interest! Your status will update to Selected if you are chosen off the waitlist." />
  const ConfirmedFree = <GoodNews text="Thanks for confirming your spot!"/>
  const Confirmed = (
    <div className="flex gap-2">
      <GoodNews text="Thanks for confirming your spot! Remember to pay when you can!"/>
      { payBar }
    </div>
  )
  const ConfirmedAndPaid = <GoodNews text="Thanks for confirming and paying - you're all set for the trip!"/>
  const Attended = <GoodNews text="Thanks for exploring with us! Please join us again soon!"/>
  const AttendedNeedPay = (
    <div className="flex gap-2">
      <GoodNews text="Thanks for exploring with us! Remember to pay when you can (or we'll pester you)!"/>
      { payBar }
    </div>
  )
  const NoShow = <BadNews text="You were recorded as a no show. This will negatively impact your odds of getting on future trips." />

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
      case SignupStatus.Waitlisted:
        if (trip.userData!.confirmed) content = WaitlistedConfrimed
        else content = Waitlisted
        break;
      case SignupStatus.Selected:
        if (trip.userData!.confirmed) {
          if (trip.class == TripClass.Free) content = ConfirmedFree
          else {
            if (trip.userData!.paid) content = ConfirmedAndPaid
            else content = Confirmed
          }
        } else content = Selected
        break;
      case SignupStatus.Attended:
        if (trip.userData!.paid || trip.class == TripClass.Free ) content = Attended
        else content = AttendedNeedPay
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
    <>
      {content}
      { showPopup && (<Popup onClose={() => setShowPopup(false)}>
        <div className="flex flex-col justify-center gap-2">
          <h1 className="text-boc_green font-funky text-center">Are you sure?</h1>
          <p>This action is not reversible.</p>
          <BOCButton text="Cancel" onClick={() => simpleUpdate(`/trip/${trip.id}/participate/cancel`)} negative></BOCButton>
        </div>
      </Popup>)}
    </>
  )
}