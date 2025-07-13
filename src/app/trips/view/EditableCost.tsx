//This is so complicated, it needs it's own special file *wah*
'use client'

import { TripClass, TripWithSignup } from "@/models/models";
import { Requesters } from "@/scripts/requests";
import { ChangeEvent, useRef, useState, KeyboardEvent, useEffect, } from "react";
import { EditIcon } from "./editable";

export default function EditableCost(props: { trip: TripWithSignup, reqs: Requesters, cost: number }) {
  const [showInput, setShowInput] = useState(false);
  const [iptClassVal, setIptClassVal] = useState(props.trip.class ? props.trip.class : null);
  const [iptPriceVal, setIptPriceVal] = useState(props.trip.priceOverride ? props.trip.priceOverride : null);
  const inputClassRef = useRef<HTMLInputElement>(null);
  const inputPriceRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = async (key: string) => {
    if (key === "Enter") {
      let body;
      if (iptClassVal && !iptPriceVal) {
        body = { 
          priceOverride: null,
          class: iptClassVal, 
        }
      } else if (!iptClassVal && iptPriceVal) {
        body = { 
          class: null, 
          priceOverride: iptPriceVal,
        }
      } else {
        console.log("This should be impossible");
        setShowInput(false);
        return;
      }
      await props.reqs.backendPost(`/trip/${props.trip.id}/lead/alter`, body);
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
      if (!iptClassVal && iptPriceVal) {
        inputPriceRef.current?.focus()
      } else {
        inputClassRef.current?.focus()
      }
    }
    else {
      //Reset values - sometimes residual values from previous usages of the feature mess things up 
      setIptClassVal(props.trip.class ? props.trip.class : null)
      setIptPriceVal(props.trip.priceOverride ? props.trip.priceOverride : null)
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
        disabled={!!iptPriceVal}
        ref={inputClassRef}
      />
      <input
        name="priceOverride"
        type="number"
        step="5"
        min={0}
        max={1000}
        value={iptPriceVal ? iptPriceVal : ""}
        onChange={(e: ChangeEvent<HTMLInputElement>)=>{setIptPriceVal(Number(e.target.value))}}
        className='border border-gray-300 rounded px-2 py-1 w-full'
        placeholder="Price Override"
        disabled={!!iptClassVal}
        ref={inputPriceRef}
      />
    </div>
    : <div onClick={() => setShowInput(true)} className="cursor-pointer mb-1">
      <p>
        <span className="font-bold mr-2">Cost:</span>
        {props.cost === 0 ? "Free!" : "$" + String(props.cost)} &nbsp;
        {EditIcon}
      </p>
    </div>
  )

}