//This is so complicated, it needs it's own special file *wah*
'use client'

import { TripClass, TripWithSignup } from "@/models/models";
import { Requesters } from "@/scripts/requests";
import { ChangeEvent, useRef, useState, KeyboardEvent, useEffect, } from "react";
import { EditIcon } from "./editable";
import { formatCost } from "@/utils/utils";

export default function EditableCost(props: { trip: TripWithSignup, reqs: Requesters, cost: number | null }) {
  const [showInput, setShowInput] = useState(false);
  const [iptClassVal, setIptClassVal] = useState(props.trip.class ? props.trip.class : null);
  //Compare against null, not truthiness - a priceOverride of 0 is a real value, and
  //treating it as "unset" makes a free-by-override trip impossible to set or edit
  const [iptPriceVal, setIptPriceVal] = useState(props.trip.priceOverride ?? null);
  const inputClassRef = useRef<HTMLInputElement>(null);
  const inputPriceRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = async (key: string) => {
    if (key === "Enter") {
      let body;
      //Free trips are class Z, and the backend rejects a 0 override outright - say so
      //here rather than letting it through to surface as a raw SQL error
      if (iptPriceVal === 0) {
        inputPriceRef.current?.setCustomValidity('Use class Z for a free trip, not a $0 override.')
        inputPriceRef.current?.reportValidity()
        return;
      }
      if (iptClassVal && iptPriceVal == null) {
        body = {
          priceOverride: null,
          class: iptClassVal,
        }
      } else if (!iptClassVal && iptPriceVal != null) {
        body = {
          class: null,
          priceOverride: iptPriceVal,
        }
      } else {
        //Neither field filled in, or somehow both - nothing coherent to submit
        setShowInput(false);
        return;
      }
      await props.reqs.backendPost(`/trip/${props.trip.id}/lead/alter`, body)
        .catch((err)=>{
          switch (err.status) {
            case (403):
            case (422):
              alert(`The backend didn't like what you just tried to do. Here's what it had to say about it: ${err.response.data.errMessage}`);
              break;
            default:
              alert(`ERROR. You shouldn't be seeing this! Contact the website's admin and send them a picture of this message! ${err}`)
              console.log(err);
              break;
          }
        });
      window.location.reload();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const nextFocusTarget = e.relatedTarget as HTMLElement | null;
    if (!containerRef.current?.contains(nextFocusTarget)) {
      setShowInput(false);
    }
  }
  
  const assignClass = (newClass: string) => {
    setIptClassVal(newClass as TripClass)
    if (!(Object.values(TripClass).includes(newClass as TripClass) || newClass == "")) {
      inputClassRef.current?.setCustomValidity('Please enter a valid class (A-J or Z).')
      inputClassRef.current?.reportValidity()
    }
  }

  useEffect(()=>{
    if (showInput) {
      //One of the the input fields MUST be in focus at all times or else UI breaks, so set one in focus on reveal
      if (!iptClassVal && iptPriceVal != null) {
        inputPriceRef.current?.focus()
      } else {
        inputClassRef.current?.focus()
      }
    }
    else {
      //Reset values - sometimes residual values from previous usages of the feature mess things up
      setIptClassVal(props.trip.class ? props.trip.class : null)
      setIptPriceVal(props.trip.priceOverride ?? null)
    }
  }, [showInput])

  return (showInput ?
    <div 
      className="grid grid-cols-2 gap-4 w-full" 
      onKeyDown={(e: KeyboardEvent) => handleKeyDown(e.key)} 
      onBlur={handleBlur}
      ref={containerRef}
    >
      <input
        name="class"
        type="text"
        value={iptClassVal ? iptClassVal : ""}
        onChange={(e: ChangeEvent<HTMLInputElement>)=>{assignClass(e.target.value)}}
        className='border border-gray-300 rounded px-2 py-1 w-full'
        maxLength={1}
        pattern="^[A-J, Z]{1}$"
        placeholder="Trip Class (A-J, Z)"
        disabled={iptPriceVal != null}
        ref={inputClassRef}
      />
      <input
        name="priceOverride"
        type="number"
        step="5"
        min={1}
        max={1000}
        value={iptPriceVal ?? ""}
        //An empty field means "no override", not a price of zero
        onChange={(e: ChangeEvent<HTMLInputElement>)=>{
          e.target.setCustomValidity(''); //Clear any message from a previous attempt
          setIptPriceVal(e.target.value === "" ? null : Number(e.target.value));
        }}
        className='border border-gray-300 rounded px-2 py-1 w-full'
        placeholder="Price Override"
        disabled={!!iptClassVal}
        ref={inputPriceRef}
      />
    </div>
    : <div onClick={() => setShowInput(true)} className="cursor-pointer mb-1">
      <p>
        <span className="font-bold mr-2">Cost:</span>
        {formatCost(props.cost)} &nbsp;
        {EditIcon}
      </p>
    </div>
  )

}