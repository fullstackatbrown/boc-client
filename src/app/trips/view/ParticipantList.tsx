import HoverButton from "@/components/HoverButton";
import { TripParticipant, SignupStatus, TripStatus, TripWithSignup } from "@/models/models";
import { Requesters } from "@/scripts/requests";
import { useEffect, useRef, useState } from "react";
import { FaceFrownIcon } from "@heroicons/react/24/outline";

//NOTE: reqs is used here to flag whether or not participant removal should be enabled, which is perhaps not the best practice, 
//but I don't want to add another annoying boolean flag...
//So, only specify reqs IF you want participant removal to be enabled!
export default function ParticipantList({ trip, participants, reqs }:{ trip: TripWithSignup, participants: TripParticipant[], reqs?: Requesters }) {
  const extraData = !([TripStatus.Staging, TripStatus.Open].includes(trip.status));
  return (
    <div className="flex justify-center">
      <table className="table-fixed w-full border-separate border-spacing-2">
        {/* <colgroup>
          <col style={{ width: "33.3%" }} />
          <col style={{ width: "33.3%" }} />
          <col style={{ width: "33.4%" }} />
        </colgroup> */}
        <tbody>
          <tr className="px-4 py-2 text-center font-bold">
            <Th>NAME</Th>
            <Th>EMAIL</Th>
            { extraData 
              ? <>
                <Th>CONFIRMED</Th>
                <Th>PAID</Th>
              </> 
              : <></>}
          </tr>
          {participants.map((part, index) => (
            <ParticipantRow key={index} part={part} extraData={extraData} trip={trip} reqs={reqs} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function onRemoveParticipant(part: TripParticipant, trip: TripWithSignup, reqs: Requesters) {
  const { backendPost } = reqs;
  backendPost(`/trip/${trip.id}/lead/remove-participant`, { email: part.email })
    .then((_res) => window.location.reload())
    .catch((err) => alert(`You should not be seeing this! Contact a site administrator and share this message with them. ERROR: ${err}`));
}

function ParticipantRow({ part, extraData, trip, reqs }: { part: TripParticipant, extraData: boolean, trip: TripWithSignup, reqs?: Requesters }) {
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleRowClick = (e: React.MouseEvent) => {
    if (!reqs) return;
    e.stopPropagation();
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    // Logic to close the menu if clicking anywhere else
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuPosition(null);
      }
    };
    // Only add the listener if the menu is actually open
    if (menuPosition) {
      document.addEventListener("click", handleClickOutside);
    }
    // Cleanup listener on unmount or when menu closes
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuPosition]);

  return (
    <tr 
      className={`px-4 py-2 text-center ${reqs ? 'cursor-pointer hover:bg-boc_lightbrown' : ''}`} 
      onClick={handleRowClick}
    >
      <Td>
        {part.firstName} {part.lastName}
        {/* The Popup Menu 
           Placed inside the first TD to maintain valid HTML table structure,
           but positioned Fixed relative to the viewport.
        */}
        {menuPosition && (
          <div
            ref={menuRef}
            className="fixed z-50 bg-background border border-red-500 shadow-lg rounded-2xl p-2"
            style={{ 
              top: menuPosition.y, 
              left: menuPosition.x 
            }}
            // Stop propagation on the menu itself so clicking inside the menu doesn't close it
            onClick={(e) => e.stopPropagation()} 
          >
            <HoverButton 
              header="Remove Participant" 
              icon={<FaceFrownIcon className="w-5 h-5 text-red-500"/>} 
              negative
              onClick={() => {
                onRemoveParticipant(part, trip, reqs!);
                setMenuPosition(null); // Close menu after action
              }} />
          </div>
        )}
      </Td>
      <Td>{part.email}</Td>
      { extraData 
      ? <>
        <Td>{part.confirmed ? "Yup!" : "Not Yet..."}</Td>
        <Td>{part.status == SignupStatus.NoShow ? <span className="text-red-500">No Show</span> : part.paid ? "Yup!" : "Not Yet..."}</Td>
      </>
      : <></>
      }
    </tr>
  );
}

// function ParticipantRow({ part, extraData }: { part: TripParticipant, extraData: boolean }) {
//   return (
  //   <tr className="px-4 py-2 text-center">
  //     <Td>{part.firstName} {part.lastName}</Td>
  //     <Td>{part.email}</Td>
  //     { extraData 
  //     ? <>
  //       <Td>{part.confirmed ? "Yup!" : "Not Yet..."}</Td>
  //       <Td>{part.status == SignupStatus.NoShow ? <span className="text-red-500">No Show</span> : part.paid ? "Yup!" : "Not Yet..."}</Td>
  //     </>
  //     : <></>
  //     }
  //   </tr>
  // );
// }

function Td(props: { children: React.ReactNode }) {
  return (
    <td className="border-boc_green rounded-lg p-[5px] text-center text-boc_darkbrown border-2 overflow-x-scroll">
      {props.children}
    </td>
  );
}

function Th(props: { children: React.ReactNode }) {
  return (
    <th
      className="border-boc_green rounded-t-lg p-[5px] bg-green-100 
    text-center text-boc_darkbrown border-2"
    >
      {props.children}
    </th>
  );
}