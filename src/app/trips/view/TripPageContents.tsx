import { TripWithSignup, TripRole } from "@/models/models";
import { Requesters } from "@/scripts/requests";

import Title from "@/components/Title";
import TripInfoBar from "./TripInfoBar";
import { EditIcon, EditableComponent } from "./editable";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import BottomLeaderControls from "./BottomLeaderControls";

export default function TripPageContents({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {

  function EditableTitle({ editable }:{ editable: boolean }) {
    if (editable) {
      return <EditableComponent 
        currVal={trip.tripName}
        withIcon={
          <div className="pb-0 w-full"> {/*Copied from Title*/}
            <h1 className="text-3xl sm:text-4xl desktop:text-5xl text-boc_green font-funky">
              {trip.tripName} &nbsp;
              <PencilSquareIcon className="w-auto mb-1 h-6 sm:h-8 desktop:h-10 inline text-boc_medbrown"/>
            </h1>
            <hr className="bg-boc_medbrown border-0 h-[2px] my-5" />
          </div>
        }
        editEl={<input className={
          //Arbitrary sizes, not the named steps: those also set line-height, which would
          //change the input's height from what the old inline 3rem gave
          "text-[1.875rem] sm:text-[2.25rem] desktop:text-[3rem]"
        } type="text"></input>}
        createBody={(newVal: string)=>{ return { tripName: newVal }}}
        trip={trip} reqs={reqs}
        />
    } else { return(
      <Title text={trip.tripName}/>
    )}
  }

  function TripBlurb({ editable }:{ editable: boolean }) {
    if (editable) {
      return <EditableComponent 
          currVal={trip.blurb ? trip.blurb : ""}
          withIcon={
            <p className="my-4">
              {trip.blurb} &nbsp;
              {EditIcon}
            </p>
          }
          editEl={<textarea style={{ marginTop: "1rem" }} rows={4}></textarea>}
          createBody={(newVal: string)=>{return { blurb: newVal }}}
          trip={trip} reqs={reqs}
        />
    } else { return (
      <p className="my-4">{trip.blurb}</p>
    )} 
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="w-full px-6 sm:px-10 desktop:px-14 flex flex-col gap-y-4">
        <EditableTitle editable={trip.userData?.tripRole == TripRole.Leader}/>
        {/*The inner inset is desktop-only - below that the page needs its full width*/}
        <main className="px-0 desktop:px-[min(13rem,20%)]">
          <TripInfoBar trip={trip} reqs={reqs}/>
          <TripBlurb editable={trip.userData?.tripRole == TripRole.Leader}/>
          { trip.userData?.tripRole == TripRole.Leader 
            ? <BottomLeaderControls trip={trip} reqs={reqs}/>
            : <></>
          }
        </main>
      </div>
    </div>
  );
}