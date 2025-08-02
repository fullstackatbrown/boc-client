"use client"

import { TripParticipant, TripStatus, TripWithSignup } from "@/models/models";
import { Requesters } from "@/scripts/requests";
import { AxiosResponse } from "axios";
import { ReactNode, useState, useEffect } from "react";
import ParticipantList from "./ParticipantList";
import Dropdown from "@/components/Dropdown";
import { ArrowDownTrayIcon, ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

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
function ParticipantDropdown({ header, signups, trip }:{ header: string, signups: TripParticipant[], trip: TripWithSignup }) {
  const copyIcon = <ClipboardDocumentIcon className={`w-5 h-5 text-boc_darkgreen`}/>;
  const [currCopyIcon, setCurrCopyIcon] = useState<ReactNode>(copyIcon);
  return <Dropdown
    header={header}
    content={<ParticipantList trip={trip} participants={signups}/>}
    sideActions={[
      { 
        header: "Copy All Emails",
        icon: copyIcon,
        repIcon: {
          replacementIcon: <ClipboardDocumentCheckIcon className={`w-5 h-5 text-boc_darkgreen`}/>,
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
    ]}
  />
}

export default function KeyInfoBar({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  const { backendGet } = reqs;
  const [signups, setSignups] = useState<TripParticipant[]|null>(null);
  useEffect(()=>{
    backendGet(`/trip/${trip.id}/lead/participants`)
      .then((res: AxiosResponse<any,any>) => setSignups(res.data))
      .catch((err) => alert(`ERROR: ${err}`));
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
      if (signups) {
        const confirmedNum = signups.reduce((accum: number, tp: TripParticipant) => (tp.confirmed ? accum + 1 : accum), 0);
        const pendingNum = signups.length - confirmedNum;
        const paidNum = signups.reduce((accum: number, tp: TripParticipant) => (tp.paid ? accum + 1 : accum), 0);
        const bar = Bar(<div className="flex gap-3">
            <p><span className="font-bold">Pending:</span>&nbsp;{pendingNum}</p>
            <p><span className="font-bold">Confirmed:</span>&nbsp;{confirmedNum}</p>
            <p><span className="font-bold">Paid:</span>&nbsp;{paidNum}</p>
          </div>);
        content = <div className="flex flex-col gap-1">
          <ParticipantDropdown header="Participant List" signups={signups} trip={trip}/>
          { bar }
        </div>
      }
      break;
    case TripStatus.PostTrip:
      content = <></>;
      break;
  }
  return (content ? content : <></>)
}