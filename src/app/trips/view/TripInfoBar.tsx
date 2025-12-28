'use client'

import { TripWithSignup, SimpleUser, TripRole } from "@/models/models";
import imgPlaceholder from "@/assets/images/trips/img-placeholder.png"
import Logo from "@/assets/images/header/logo.svg"
import SignupButton from "./SignupButton";
import { Requesters } from "@/scripts/requests";
import { useRef, useState, useEffect, ReactElement } from "react";
import { EditIcon, EditableComponent, EditableString } from "./editable";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import EditableCost from "./EditableCost";
import { formatDateString } from "@/utils/utils"

function classToCost(cls: string): number | undefined {
  const mapping: Record<string, number> = { //Thanks Chat
    A: 5,
    B: 10,
    C: 15,
    D: 20,
    E: 25,
    F: 30,
    G: 35,
    H: 40,
    I: 45,
    J: 50,
    Z: 0
  };
  return mapping[cls];
}

async function findLeaderEmails(trip: TripWithSignup, reqs: Requesters): Promise<string[]> {
  if (trip.userData?.tripRole == TripRole.Leader) {
    const resp = await reqs.backendGet("/leaders")
      .catch((err) => {
        alert(`You should not be getting this error! Please take a screenshot of this and send it to this website's administrator. Error: ${err}`)
      });
    if (!resp) { return [] } //Error was caught with .catch
    const allLeaderEmails = resp.data.map((leader: SimpleUser) => leader.email); 
    const currTripLeaderEmails = trip.leaders.map((leader: SimpleUser) => leader.email);
    return allLeaderEmails.filter((email: string) => !currTripLeaderEmails.includes(email));
  } else { return [] }
} 

interface EditItems {
  editEl: ReactElement, //Should only be an input, textarea, or select element
  createBody: (newVal: string)=>Object,
  createCurrVal: (currVal: string)=>string,
  icon?: ReactElement, //Default icon is pencilSquareIcon
}

interface EditSpecs {
  leaders: EditItems,
  tripCategory: EditItems, 
  date: EditItems,
  endDate: EditItems,
}

const tripCats = ['Hiking', 'Camping', 'Backpacking', 'Biking', 'Climbing', 'Skiing', 'Water', 'Event', 'Running', 'Exploration', 'Local', 'Special'];
async function createEditSpecs(trip: TripWithSignup, reqs: Requesters): Promise<EditSpecs> {
  return {
    leaders: {
      editEl: (<select>
          <option value="" disabled>Select Leader to Add</option>
          {(await findLeaderEmails(trip, reqs)).map((cat: string)=>{
            return <option key={cat} value={cat}>{cat}</option>
          })}
      </select>),
      createBody: (newVal: string) => { return { newLeader: newVal } },
      createCurrVal: (_currVal: string) => { return "" },
      icon: <UserPlusIcon className="w-auto h-6 inline text-boc_medbrown"/>
    },
    tripCategory: {
      editEl: (<select>
        <option value="" disabled>Select Category</option>
        {tripCats.map((cat: string)=>{
          return <option key={cat} value={cat}>{cat}</option>
        })}
      </select>),
      createBody: (newVal: string) => { return { category: newVal } },
      createCurrVal: (currVal: string) => { return currVal }
    },
    date: {
        editEl: <input type="date"/>,
        createBody: (newVal: string) => { 
          //alert(newVal)
          return { plannedDate: newVal } 
        },
        createCurrVal: (currVal: string) => { return (new Date(currVal)).toISOString().split('T')[0] }
    },
    endDate: {
      editEl: <input type="date"/>,
      createBody: (newVal: string) => { 
        //alert(newVal)
        return { plannedEndDate: newVal } 
      },
      createCurrVal: (currVal: string) => { return (new Date(currVal)).toISOString().split('T')[0] }
    }
  }
}

export default function TripInfoBar({ trip, reqs }:{ trip: TripWithSignup, reqs: Requesters }) {
  //Annoying stuff to properly set the height the image
  const infoRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);
  const [editSpecs, setEditSpecs] = useState<EditSpecs|null>(null);

  useEffect(()=>{ 
    if (trip.userData?.tripRole == TripRole.Leader) {
      createEditSpecs(trip, reqs)
        .then((editSpecs) => setEditSpecs(editSpecs))
    };
  }, [])

  function TripInfo({ lead, text, editable }:{ lead: string, text: string, editable?: EditItems | ReactElement }) {
    if (!editable) {
      return (
        <div className="mb-1">
          <p><span className="font-bold mr-2">{lead}:</span>{text}</p>
        </div>
      )
    } else if (('editEl' in editable) && ('createBody' in editable) && ('createCurrVal' in editable)) { //Check if it's an EditItem - yes, this is very scuffed but unfortunately, it seemed like the best option here
      return (
        <EditableString currVal={editable.createCurrVal(text)} editEl={editable.editEl} onSubmit={
          async (newVal: string) => { 
            return reqs.backendPost(`/trip/${trip.id}/lead/alter`, editable.createBody(newVal))
          }
        }>
          <div className="mb-1">
            <p>
              <span className="font-bold mr-2">{lead}:</span>
              {text} &nbsp;
              {editable.icon ? editable.icon : EditIcon}
            </p>
          </div>
        </EditableString>
      )
    } else { //We know now that editable is a ReactElement and can just be returned as is - this exists to handle EditableCost
      return editable
    }
  }

  function TripImage() {
    const src = (trip.image ? trip.image : imgPlaceholder.src)
    const baseImg = (
      <div ref={imageRef} style={{ height }} className="w-80 flex-shrink-0 relative">
        <img
          src={src}
          className="w-full h-full object-cover rounded-2xl"
          style={{ objectPosition: 'center' }}
        />
      </div>
    )
    if (trip.userData?.tripRole == TripRole.Leader) {
      return (
        <EditableComponent
          currVal={trip.image ? trip.image : ""}
          withIcon={<>
            {baseImg}
            <div className="absolute top-2 right-2 bg-gray-50 aspect-square h-7 pl-1 pb-1 rounded-lg">
              {EditIcon}
            </div>
          </>}
          editEl={<input type="text" placeholder="Image URL"/>}
          createBody={(newVal: string) => { return { image: newVal } }}
          trip={trip}
          reqs={reqs}
        />
      )
    } else {
      return baseImg
    }
  }

  useEffect(() => { //Effect to properly set image height - can't be done right with CSS unfortunately
    if (infoRef.current) {
      const infoHeight = infoRef.current.offsetHeight;
      setHeight(infoHeight);
    }
  }, [trip, infoRef]);

  
  const cost = (trip.class ? classToCost(trip.class)! : trip.priceOverride! )
  return (
    <div className="w-full pt-4">
      <div className="flex flex-row gap-x-4">
        {/* Image wrapper with dynamic height */}
        <div style={{ height }} className="w-80 flex-shrink-0 relative">
          { TripImage() }
        </div>

        {/* Info panel with dynamic height reference */}
        <div ref={infoRef} className="flex flex-col gap-4 flex-grow">
          <div className="w-full bg-boc_lightgreen rounded-2xl pt-4 pb-8 px-10">
            <h2 className="w-full text-center text-boc_green font-funky text-3xl mb-3">Trip Info</h2>
            <div className="flex justify-around flex-col">
              <TripInfo lead="Leaders" text={trip.leaders.map((leader: SimpleUser) => `${leader.firstName} ${leader.lastName}`).join(", ") || "No leaders assigned"} editable={
                trip.userData?.tripRole == TripRole.Leader ? editSpecs?.leaders : undefined
              }/>
              <TripInfo lead="Trip Category" text={trip.category || "Not specified"} editable={
                trip.userData?.tripRole == TripRole.Leader ? editSpecs?.tripCategory : undefined
              }/>
              <TripInfo lead={trip.plannedEndDate ? "Start Date" : "Date"} text={trip.plannedDate ? formatDateString(trip.plannedDate) : "Date not set"} editable={
                trip.userData?.tripRole == TripRole.Leader ? editSpecs?.date : undefined
              } />
              { trip.plannedEndDate
              ? <TripInfo lead="End Date" text={formatDateString(trip.plannedEndDate)} editable={
                trip.userData?.tripRole == TripRole.Leader ? editSpecs?.endDate : undefined
              } />
              : <></>
              }
              <TripInfo lead="Cost" text={cost === 0 ? "Free!" : "$" + String(cost)} editable={
                trip.userData?.tripRole == TripRole.Leader ? <EditableCost trip={trip} reqs={reqs} cost={cost}/> : undefined
              }/>

            </div>
          </div>
          <SignupButton trip={trip} reqs={reqs} />
        </div>
      </div>
    </div>
  )
}