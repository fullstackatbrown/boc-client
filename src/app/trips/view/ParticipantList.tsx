import HoverButton from "@/components/HoverButton";
import { TripParticipant, SignupStatus, TripStatus, TripWithSignup } from "@/models/models";
import { Requesters } from "@/scripts/requests";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaceFrownIcon } from "@heroicons/react/24/outline";

//NOTE: reqs is used here to flag whether or not participant removal should be enabled, which is perhaps not the best practice, 
//but I don't want to add another annoying boolean flag...
//So, only specify reqs IF you want participant removal to be enabled!
export default function ParticipantList({ trip, participants, reqs }:{ trip: TripWithSignup, participants: TripParticipant[], reqs?: Requesters }) {
  const extraData = !([TripStatus.Staging, TripStatus.Open].includes(trip.status));
  return (
    <div className="flex justify-center">
      {/* Below sm the table becomes stacked cards via display toggles, so each row stays one click target */}
      <table className="block sm:table table-fixed w-full border-separate border-spacing-2">
        {/* <colgroup>
          <col style={{ width: "33.3%" }} />
          <col style={{ width: "33.3%" }} />
          <col style={{ width: "33.4%" }} />
        </colgroup> */}
        <tbody className="block sm:table-row-group">
          {/* The cards below sm carry their own labels, so the header only exists as a table */}
          <tr className="hidden sm:table-row px-4 py-2 text-center font-bold">
            <Th>NAME</Th>
            <Th>EMAIL</Th>
            { extraData 
              ? <>
                <Th>CONFIRMED</Th>
                <Th>PAID</Th>
              </> 
              : <></>}
          </tr>
          {participants.map((part) => (
            <ParticipantRow key={part.email} part={part} extraData={extraData} trip={trip} reqs={reqs} />
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

  // Below desktop the menu is wide relative to the screen, so a raw click near an edge puts it
  // off-viewport. Nudge it back using its measured size. Desktop keeps the raw coordinates.
  useLayoutEffect(() => {
    if (!menuPosition || !menuRef.current || window.innerWidth >= 1150) return;
    const { width, height } = menuRef.current.getBoundingClientRect();
    const x = Math.max(8, Math.min(menuPosition.x, window.innerWidth - width - 8));
    const y = Math.max(8, Math.min(menuPosition.y, window.innerHeight - height - 8));
    if (x !== menuPosition.x || y !== menuPosition.y) setMenuPosition({ x, y });
  }, [menuPosition]);

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
      className={`flex flex-wrap gap-2 mb-4 sm:table-row sm:mb-0 px-4 py-2 text-center ${reqs ? 'cursor-pointer hover:bg-boc_lightbrown' : ''}`}
      onClick={handleRowClick}
    >
      <Td className="w-full sm:w-auto">
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
      <Td className="w-full sm:w-auto">{part.email}</Td>
      { extraData
      ? <>
        {/* Below sm the two status cells collapse into one sentence, since the header that
            labelled them is hidden there. No Show still displaces the paid value, in red. */}
        <Td className="w-full sm:hidden">
          {part.confirmed ? "Confirmed" : "Not confirmed"}
          &nbsp;·&nbsp;
          {part.status == SignupStatus.NoShow ? <span className="text-red-500">No Show</span> : part.paid ? "Paid" : "Not paid"}
        </Td>
        <Td className="hidden sm:table-cell">{part.confirmed ? "Yup!" : "Not Yet..."}</Td>
        <Td className="hidden sm:table-cell">{part.status == SignupStatus.NoShow ? <span className="text-red-500">No Show</span> : part.paid ? "Yup!" : "Not Yet..."}</Td>
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

function Td(props: { children: React.ReactNode, className?: string }) {
  //Below sm long emails wrap inside the card; at sm+ the cell scrolls, as it always has
  return (
    <td className={`block sm:table-cell border-boc_green rounded-lg p-[5px] text-center text-boc_darkbrown border-2
    break-words sm:break-normal overflow-x-visible sm:overflow-x-scroll ${props.className ?? ""}`}>
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