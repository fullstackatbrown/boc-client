"use client"

import { SignupStatus, TripParticipant, TripStatus, TripWithSignup } from "@/models/models";
import { Requesters } from "@/scripts/requests";
import { AxiosResponse } from "axios";
import { ReactNode, useState, useEffect, SetStateAction, Dispatch } from "react";
import ParticipantList from "./ParticipantList";
import Dropdown from "@/components/Dropdown";
import { ArrowDownTrayIcon, ClipboardDocumentCheckIcon, ClipboardDocumentIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import HoverButton from "@/components/HoverButton";
import Popup from "@/components/Popup";

function copyStringsToClipboard(strings: string[]) {
  const text = strings.join('\n');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .catch((err) => console.log(`Failure to copy to clipboard: ${err}`))
  } else {
    alert("Browser unequiped with modern clipboard copying functionality. Please switch to a more modern browser.");
    // Fallback for older browsers
    // const textArea = document.createElement('textarea');
    // textArea.value = text;
    // document.body.appendChild(textArea);
    // textArea.focus();
    // textArea.select();
    // try {
    //   document.execCommand('copy');
    //   console.log('Copied to clipboard');
    // } catch (err) {
    //   console.error('Fallback: Copy failed', err);
    // }
    // document.body.removeChild(textArea);
  }
}

function downloadSingupsCsv(signups: TripParticipant[]) {
  //Generate headers and rows and compile into content list
  const headers = ['First Name', 'Last Name', 'Email', 'Status', 'Confirmed', 'Paid'];
  const rows = signups.map(p => [
    p.firstName,
    p.lastName,
    p.email,
    p.status,
    p.confirmed ? 'Yes' : 'No',
    p.paid ? 'Yes' : 'No',
  ]);
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  //Create downloadable blob and temporary download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'trip_signups.csv');
  //Force download link click
  document.body.appendChild(link);
  link.click();
  //Remove temporary download objects
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function addParticipant(trip: TripWithSignup, reqs: Requesters, setAddParticipantPopup: Dispatch<SetStateAction<boolean>>) {
  const { backendPost } = reqs;
  backendPost(`/trip/${trip.id}/lead/add-participant`, {})
    .then((res) => {
      if (res.data.success) window.location.reload();
      else setAddParticipantPopup(true);
    })
    .catch((err) => alert(`You shouldn't be seeing this! Send this message to a site administrator. ERROR: ${err}`));
}

const copyIcon = <ClipboardDocumentIcon className={`w-5 h-5 text-boc_darkgreen`}/>
const copiedIcon = <ClipboardDocumentCheckIcon className={`w-5 h-5 text-boc_darkgreen`}/>
function ParticipantDropdown({ header, signups, trip, reqs, setParticipantPopup }:{ header: string, signups: TripParticipant[], trip: TripWithSignup, reqs?: Requesters, setParticipantPopup?: Dispatch<SetStateAction<boolean>> }) {
  const addParticipantsIcon = <UserPlusIcon className={`w-5 h-5 text-boc_darkgreen`}/>;
  const [currCopyIcon, setCurrCopyIcon] = useState<ReactNode>(copyIcon);
  let sideActions = [
    { 
      header: "Copy Emails",
      icon: copyIcon,
      repIcon: {
        replacementIcon: copiedIcon,
        currIcon: currCopyIcon,
        setCurrIcon: setCurrCopyIcon,
      },
      onClick: () => { copyStringsToClipboard(signups.map((tp) => tp.email)) }
    },
    {
      header: "Download Table as CSV",
      icon: <ArrowDownTrayIcon className={`w-5 h-5 text-boc_darkgreen`}/>,
      onClick: () => { downloadSingupsCsv(signups) }
    }
  ];
  if (setParticipantPopup && reqs) sideActions.push({
    header: "Add Participant from Waitlist",
    icon: addParticipantsIcon,
    onClick: () => { addParticipant(trip, reqs, setParticipantPopup) }
  })
  return <Dropdown
    header={header}
    content={<ParticipantList trip={trip} participants={signups} reqs={reqs}/>}
    sideActions={sideActions}
  />
}

function NonSelectedEmailButtons({ signups }:{ signups: TripParticipant[] }) {
  const waitlistedEmails = signups.filter((su) => su.status == SignupStatus.Waitlisted).map((su) => su.email);
  const notSelectedEmails = signups.filter((su) => su.status == SignupStatus.NotSelected).map((su) => su.email);
  const [currWaitlistCopyIcon, setCurrWaitlistCopyIcon] = useState<ReactNode>(copyIcon);
  const [currNotSelectedCopyIcon, setCurrNotSelectedCopyIcon] = useState<ReactNode>(copyIcon);
  return (
    <div className="w-full flex justify-start">
      <HoverButton 
        header="Copy Waitlist Emails" 
        icon={copyIcon}
        repIcon={{
          replacementIcon: copiedIcon,
          currIcon: currWaitlistCopyIcon,
          setCurrIcon: setCurrWaitlistCopyIcon,
        }}
        onClick={() => copyStringsToClipboard(waitlistedEmails)}
      />
      <HoverButton 
        header="Copy Not Selected Emails" 
        icon={copyIcon}
        repIcon={{
          replacementIcon: copiedIcon,
          currIcon: currNotSelectedCopyIcon,
          setCurrIcon: setCurrNotSelectedCopyIcon,
        }}
        onClick={() => copyStringsToClipboard(notSelectedEmails)}
      />
    </div>
  )
}

export default function KeyInfoBar({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  const { backendGet } = reqs;
  const [signups, setSignups] = useState<TripParticipant[]|null>(null);
  const [selectedSignups, setSelectedSignups] = useState<TripParticipant[]|null>(null);
  const [addParticipantPopup, setAddParticipantPopup] = useState<boolean>(false);
  useEffect(()=>{
    backendGet(`/trip/${trip.id}/lead/participants`)
      .then((res: AxiosResponse<any,any>) => {
        setSignups(res.data)
        setSelectedSignups(res.data.filter((signup: TripParticipant) => signup.status == SignupStatus.Selected))
      }).catch((err) => alert(`ERROR: ${err}`));
  },[])
  const Bar = (text: ReactNode) => <div className="p-4 rounded-lg bg-gray-200 w-full">{text}</div>
  let content;
  switch (trip.status) {
    case TripStatus.Staging || TripStatus.Complete:
      content = <></>;
      break;
    case TripStatus.Open:
      if (signups) {
        const bar = Bar(<p>
          <span className="font-bold">Signups:&nbsp;</span> 
          {signups.length}  {signups.length < trip.maxSize 
            ? <>❌<span className="text-red-500 italic"> less signups than trip size</span></>
            : <>✅<span className="text-green-500 italic"> more (or equal) signups than trip size</span></>
          }
          </p>);
        content = <div className="flex flex-col gap-1">
          <ParticipantDropdown header="Signup List" signups={signups} trip={trip}/>
          { bar }
        </div>
      }
      break;
    case TripStatus.PreTrip:
      if (signups && selectedSignups) {
        const confirmedNum = selectedSignups.reduce((accum: number, tp: TripParticipant) => (tp.confirmed ? accum + 1 : accum), 0);
        const paidNum = selectedSignups.reduce((accum: number, tp: TripParticipant) => (tp.paid ? accum + 1 : accum), 0);
        const bar = Bar(<div className="flex gap-3">
            <p><span className="font-bold">Confirmed:</span>&nbsp;{confirmedNum} / {selectedSignups.length}</p>
            <p><span className="font-bold">Paid:</span>&nbsp;{paidNum} / {selectedSignups.length}</p>
          </div>);
        content = <div className="flex flex-col gap-1">
          <ParticipantDropdown header="Participant List" signups={selectedSignups} trip={trip} reqs={reqs} setParticipantPopup={setAddParticipantPopup}/>
          { bar }
          <NonSelectedEmailButtons signups={signups} />
        </div>
      }
      break;
    case TripStatus.PostTrip:
      if (selectedSignups) {
        const paidNum = selectedSignups.reduce((accum: number, tp: TripParticipant) => (tp.paid ? accum + 1 : accum), 0);
        const bar = Bar(<div className="flex gap-3">
            <p><span className="font-bold">Paid:</span>&nbsp;{paidNum} / <span className="text-red-500">?</span>&nbsp;<span className="italic">Take attendance to know how many payments are needed</span></p>
          </div>);
        content = <div className="flex flex-col gap-1">
          <ParticipantDropdown header="Participant List" signups={selectedSignups} trip={trip}/>
          { bar }
        </div>
      }
      break;
    case TripStatus.Complete:
      if (signups) {
        const attendedSignups = signups.filter((tp: TripParticipant) => tp.status == SignupStatus.Attended);
        const paidNum = attendedSignups.reduce((accum: number, tp: TripParticipant) => (tp.paid ? accum + 1 : accum), 0);
        const paymentsNeeded = attendedSignups.length;
        const bar = Bar(<div className="flex gap-3">
            <p>
              <span className="font-bold">Paid:</span>&nbsp;{paidNum} / {paymentsNeeded}&nbsp;
              { paidNum < paymentsNeeded ? <>❌</> : <>✅</> }
            </p>
          </div>);
        content = <div className="flex flex-col gap-1">
          <ParticipantDropdown header="Participant List" signups={attendedSignups} trip={trip}/>
          { bar }
        </div>
      }
      break;
  }
  return (content 
    ? <>
      { content }
      { addParticipantPopup 
        ? <Popup onClose={()=>{setAddParticipantPopup(false)}}>
            <p className="mt-2">No more signups on the waitlist to add.</p>
          </Popup>
        : <></>
      }
    </> : <></>)
}