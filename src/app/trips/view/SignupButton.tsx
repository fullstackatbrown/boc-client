'use client'

import { ReactNode, Suspense, useEffect, useState } from "react";
import { TripWithSignup } from "@/models/models";
import { SignupVariant, selectSignupVariant } from "./signupVariant";
import BOCButton from "@/components/BOCButton";
import { AuthStat, Requesters } from "@/scripts/requests";
import Popup from "@/components/Popup";
import { signIn } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import { CLASS_COST, classCombination, formatCost, tripCost } from "@/utils/utils";

function Message({ text, bgColor, textColor}: { text: string, bgColor: string, textColor: string }) {
  return (
    <div className={`p-4 rounded-lg ${bgColor}`}>
      {/*Clamped only where two lines are enough - narrower than that it would hide most of the message*/}
      <p className={`desktop:line-clamp-2 overflow-scroll ${textColor}`}>{text}</p>
    </div>
  )
}

function Informational({ text }:{ text: string }) { return <Message text={text} bgColor="bg-gray-200" textColor="text-gray-600"/> }
function BadNews({ text }: { text: string }) { return <Message text={text} bgColor="bg-red-200" textColor="text-red-600"/> }
function GoodNews({ text }: { text: string }) { return <Message text={text} bgColor="bg-boc_lightgreen" textColor="text-boc_darkgreen"/> }

const STORE_URL = "https://payment.brown.edu/C20460_ustores/web/store_cat.jsp?STOREID=2&CATID=396";

export default function SignupButton({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) { //Any component that uses useSearchParams MUST be wrapped in a Suspense component as of the latest Next version
  return (
    <Suspense fallback={<div className="px-6 sm:px-10 desktop:px-20 text-center">Loading...</div>}>
      <SignupButtonContent trip={trip} reqs={reqs}/>
    </Suspense>
  )
}

function SignupButtonContent({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  //Signup/confirm/cancel functionality
  const { backendPost, sessionStatus } = reqs;
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function AutoSignupIfParam() {
    useEffect(() => {
      const action = searchParams.get("post_login_action");
      if (action === 'signup') {
        sessionStatus()
          .then((stat: AuthStat) => {
            if (stat == AuthStat.Auth) { simpleUpdate(`/trip/${trip.id}/signup`) }
            else { console.error("Someone's messing with URL params...") } 
          })
      }
    }, [searchParams])
    return <></>
  }

  async function simpleUpdate(path: string) {
    let stat = await sessionStatus()
    const params = new URLSearchParams(searchParams.toString());
    if (stat != AuthStat.Auth) { //Users may not be signed in
      if (!path.endsWith("signup")) { //Sanity check that user is indeed using the Sign Up button and not another button (shouldn't be possible)
        alert("You shouldn't be seeing this message! Please report this to a site admin if possible. ERROR: Unauthenticated user pushed non-signup button");
        return
      }
      params.set("post_login_action", "signup");
      await signIn("google", { callbackUrl: `${window.location.origin}${pathname}?${params.toString()}`});
      //signIn navigates away; the post is retried after login via post_login_action
      return;
    }
    await backendPost(path, {});
    params.delete("post_login_action"); //In case it was in use
    window.location.href = `${pathname}?${params.toString()}`;
  }
  const [showPopup, setShowPopup] = useState(false);
  const [showPayPopup, setShowPayPopup] = useState(false);
  //Helper Components
  //Payment happens on the Marketplace; the backend records it from the store's emailed
  //receipt, matching on the buyer's email and the item's price - hence the instructions
  const payBar = ( 
    <div className="flex flex-col gap-1 w-full desktop:w-auto desktop:shrink-0">
      <BOCButton text="Pay" onClick={() => setShowPayPopup(true)} grow/>
      <a href="/about/financial-aid" className="text-sm underline nowrap">Financial Aid Policy</a> 
    </div>
  )
  const price = tripCost(trip);
  const cost = formatCost(price);
  //Override trips have no store item of their own: buy a special one if the club made
  //it, else the classes that add up to the price - in one cart, so the receipt total matches
  const combination = price && price % 5 === 0
    ? classCombination(price).map((c) => `Class ${c} (${formatCost(CLASS_COST[c])})`).join(" + ")
    : null;
  const storeItem = trip.class
    ? <>Buy the <b>Outing Club-Class {trip.class} Trip</b> item ({cost}).</>
    : combination
    ? <>First look for a special Marketplace item priced exactly <b>{cost}</b> for this trip. If there isn&apos;t one, buy the Class items that add up to it - <b>{combination}</b> - <b>in the same cart, in one checkout</b>; bought separately they won&apos;t be recorded.</>
    : <>Buy the special Marketplace item priced <b>{cost}</b> for this trip.</>;
  const payPopup = (
    <Popup onClose={() => setShowPayPopup(false)}>
      <div className="flex flex-col gap-3 max-w-md">
        <h1 className="text-boc_green font-funky text-center">How to pay</h1>
        <p>Payment is through Brown Marketplace, a separate site. Two things matter there:</p>
        <ol className="list-decimal pl-5 flex flex-col gap-2">
          <li>Check out with your <b>Brown or RISD email address</b> - the one you use to sign in here. That is how we match your payment to you; payments from other addresses can&apos;t be matched.</li>
          <li>{storeItem}</li>
        </ol>
        <p>Financial aid promo codes are applied at checkout and don&apos;t affect matching. This page will show you as paid within a couple of minutes.</p>
        <BOCButton text="Go to Brown Marketplace" onClick={() => {
          window.open(STORE_URL, "_blank");
          setShowPayPopup(false);
        }}/>
      </div>
    </Popup>
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
    <div className="flex flex-col desktop:flex-row gap-2">
      {/*Stacked, the message reads first and the buttons go full-width beneath it*/}
      <div className="flex flex-col gap-1 w-full order-last desktop:order-none desktop:w-1/4 desktop:shrink-0">
        <BOCButton text="Confirm" onClick={() => simpleUpdate(`/trip/${trip.id}/participate/confirm`)}></BOCButton>
        <BOCButton text="Cancel" onClick={() => setShowPopup(true)} negative></BOCButton>
      </div>
      <GoodNews text="Congrats, you were selected! Now, confirm your spot so we know you're still interested." />
    </div>
  )
  const Waitlisted = (
    <div className="flex flex-col desktop:flex-row gap-2">
      <div className="flex flex-col gap-1 w-full order-last desktop:order-none desktop:w-1/4 desktop:shrink-0">
        <BOCButton text="Confirm" onClick={() => simpleUpdate(`/trip/${trip.id}/participate/confirm`)}></BOCButton>
        <BOCButton text="Cancel" onClick={() => setShowPopup(true)} negative></BOCButton>
      </div>
      <Informational text="You are currently on the waitlist. Confirm your interest now to jump to the top of the waitlist!"/>
    </div>
  )
  const WaitlistedConfrimed = <Informational text="Thanks for confirming your interest! Your status will update to Selected if you are chosen off the waitlist." />
  const ConfirmedFree = <GoodNews text="Thanks for confirming your spot!"/>
  const Confirmed = (
    <div className="flex flex-col desktop:flex-row gap-2">
      <GoodNews text="Thanks for confirming your spot! Remember to pay when you can!"/>
      { payBar }
    </div>
  )
  const ConfirmedAndPaid = <GoodNews text="Thanks for confirming and paying - you're all set for the trip!"/>
  const Attended = <GoodNews text="Thanks for exploring with us! Please join us again soon!"/>
  const AttendedNeedPay = (
    <div className="flex flex-col desktop:flex-row gap-2">
      <GoodNews text="Thanks for exploring with us! Remember to pay when you can (or we'll pester you)!"/>
      { payBar }
    </div>
  )
  const NoShow = <BadNews text="You were recorded as a no show. This will negatively impact your odds of getting on future trips." />

  //Return based on trip role and trip status - see signupVariant.ts for the decision logic
  const variants: Record<SignupVariant, ReactNode> = {
    [SignupVariant.Staging]: Staging,
    [SignupVariant.SignUp]: SignUpButton,
    [SignupVariant.SignupsClosed]: SignupsClosed,
    [SignupVariant.SignedUp]: SignedUp,
    [SignupVariant.NotSelected]: NotSelected,
    [SignupVariant.Waitlisted]: Waitlisted,
    [SignupVariant.WaitlistedConfirmed]: WaitlistedConfrimed,
    [SignupVariant.Selected]: Selected,
    [SignupVariant.Confirmed]: Confirmed,
    [SignupVariant.ConfirmedFree]: ConfirmedFree,
    [SignupVariant.ConfirmedAndPaid]: ConfirmedAndPaid,
    [SignupVariant.Attended]: Attended,
    [SignupVariant.AttendedNeedPay]: AttendedNeedPay,
    [SignupVariant.NoShow]: NoShow,
    [SignupVariant.Nothing]: <></>,
  };
  const content = variants[selectSignupVariant(trip)];
  return (
    <>
      {content}
      <AutoSignupIfParam/>
      { showPayPopup && payPopup }
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