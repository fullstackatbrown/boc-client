"use client"

import { TripStatus, TripWithSignup } from "@/models/models";
import { Requesters } from "@/scripts/requests";
import { EditIcon, EditableComponent } from "./editable";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import KeyInfoBar from "./KeyInfoBar";
import Popup from "@/components/Popup";


enum StatusState { Past, Current, Next, Future }

interface StatusText {
  past: string,
  current: string, 
  future: string,
}

interface StatusButtonInfo {
  stat: TripStatus,
  text: StatusText,
  onClick: ()=>void,
}

const statusButtonInfos = (trip: TripWithSignup, reqs: Requesters, setPopup: Dispatch<SetStateAction<boolean>>) => {
  const { backendPost } = reqs;
  const simpleUpdate = (path: string) => {
    backendPost(path, {})
      .then(() => window.location.reload())
      .catch((err) => alert(`You should not be seeing this! Please send a screenshot of this to the site's administrator.\n${err}`))
  }
  return [
    {
      stat: TripStatus.Staging,
      text: {
        past: "Trip Staged",
        current: "In Staging",
        future: "---" //This should never be displayed
      },
      onClick: ()=>{} //This should never be called
    },
    {
      stat: TripStatus.Open,
      text: {
        past: "Trip Opened",
        current: "Trip Open",
        future: "Open Trip",
      },
      onClick: () => simpleUpdate(`/trip/${trip.id}/lead/open`),
    },
    {
      stat: TripStatus.PreTrip,
      text: {
        past: "Pre-Trip",
        current: "Pre-Trip",
        future: "Run Lottery",
      },
      onClick: () => simpleUpdate(`/trip/${trip.id}/lead/lottery`),
    },
    {
      stat: TripStatus.PostTrip,
      text: {
        past: "Post-Trip",
        current: "Post-Trip",
        future: "Run Trip",
      },
      onClick: () => setPopup(true) //Trip running happens automatically
    },
    {
      stat: TripStatus.Complete,
      text: {
        past: "---", //This should never be displayed
        current: "Attendance Taken",
        future: "Attendance",
      },
      onClick: ()=>{
        //ATTENDANCE TAKING FUNCTIONALITY
      }
    }
  ]
}

function StatusButton({ state, text, onClick }:{ state: StatusState, text: StatusText, onClick: ()=>void }) {
  const BlankHeader = <div className="h-7 m-2"></div>;
  const Header = ({ text }:{ text: string }) => <div className="h-7 m-2 font-sm text-boc_medbrown font-funky text-center border-boc_medbrown border-b-2 flex items-center justify-center">{text}</div>;
  let extraStyle, currText, headerEl;
  switch (state) {
    case StatusState.Past:
      extraStyle = "border-dashed border-boc_medbrown opacity-50";
      currText = text.past;
      headerEl = BlankHeader;
      break;
    case StatusState.Current:
      extraStyle = "border-boc_medbrown";
      currText = text.current;
      headerEl = <Header text="Current"/>;
      break;
    case StatusState.Next:
      extraStyle = "border-boc_green bg-boc_green text-white text-xl font-bold transition ease-in hover:bg-green-700 hover:border-green-700";
      currText = text.future;
      headerEl = <Header text="Next"/>;
      break;
    case StatusState.Future:
      extraStyle = "border-boc_green opacity-50";
      currText = text.future;
      headerEl = BlankHeader;
      break;
  }
  return (
    <div className={`flex flex-col ${state == StatusState.Next ? "w-2/6" : "w-1/6"}`}>
      { headerEl }
      <div className={`py-3 px-3 rounded-xl border-4 text-center ${extraStyle}`} onClick={state == StatusState.Next ? onClick : ()=>{}}>
        { currText }
      </div>
    </div>
  )
}

const statusMap = {
  "Staging": 0,
  "Open": 1,
  "Pre-Trip": 2,
  "Post-Trip": 3,
  "Complete": 4,
}

function TripStatusBar({ trip, reqs, setPopup }:{ trip: TripWithSignup, reqs: Requesters, setPopup: Dispatch<SetStateAction<boolean>> }) {
  return (
    <div className="flex gap-2">
      { 
        statusButtonInfos(trip, reqs, setPopup).map((buttonInf: StatusButtonInfo)=>{
          let state;
          if (statusMap[buttonInf.stat] < statusMap[trip.status]) { state = StatusState.Past }
          else if (statusMap[buttonInf.stat] == statusMap[trip.status]) { state = StatusState.Current }
          else if (statusMap[buttonInf.stat] == statusMap[trip.status] + 1) { state = StatusState.Next }
          else { state = StatusState.Future }
          return <StatusButton 
              key={buttonInf.stat}
              state={state} 
              text={buttonInf.text} 
              onClick={buttonInf.onClick}
            />
        }) 
      }
    </div>
  )
}

export default function BottomLeaderControls({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  const [popup, setPopup] = useState(false);
  const sentenceDesc = <EditableComponent
      currVal={trip.sentenceDesc ? trip.sentenceDesc : ""}
      withIcon={
        <p>
          { trip.sentenceDesc ? trip.sentenceDesc : "" }
          &nbsp; { EditIcon }
        </p>
      }
      editEl={<input type="text" maxLength={100}/>}
      createBody={(newVal: string) => {return { sentenceDesc: newVal }}}
      trip={trip}
      reqs={reqs}
    />;
  const maxSize = <EditableComponent 
    currVal={ trip.maxSize.toString() }
    withIcon={
      <p>
        { trip.maxSize.toString() }
        &nbsp; { EditIcon }
      </p>
    }
    editEl={<input type="number" min={1} max={1000} step={1}/>}
    createBody={(newVal: string) => {return { maxSize: newVal }}}
    trip={trip}
    reqs={reqs}
  />
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="w-full border-b-2 border-dashed border-boc_medbrown"></div>
      <div className="flex gap-4">
        <div className="w-1/2">
          <p className="font-bold">Sentence Description:</p>
          { sentenceDesc }
        </div>
        <div className="w-1/2">
          <p className="font-bold">Trip Size:</p>
          { maxSize }
        </div>
      </div>
      <KeyInfoBar trip={trip} reqs={reqs}/>
      <TripStatusBar trip={trip} reqs={reqs} setPopup={setPopup}/>
      { popup 
        ? <Popup onClose={()=>{setPopup(false)}}>
            <p className="mt-2">Trip will "run" automatically upon trip date</p>
          </Popup>
        : <></>
      }
    </div>
  )
}