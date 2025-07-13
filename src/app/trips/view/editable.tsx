import { TripWithSignup } from "@/models/models";
import { Requesters } from "@/scripts/requests";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { ChangeEvent, ReactElement, ReactNode, cloneElement, useState } from "react";

export function EditableString(props: {currVal: string, editEl: ReactElement, onSubmit: (newVal: string)=>Promise<void>, children: ReactNode}) {
  const [showInput, setShowInput] = useState(false);
  const [iptVal, setIptVal] = useState(props.currVal);

  const handleKeyDown = async (key: string) => {
    if (key === "Enter") {
      await props.onSubmit(iptVal)
      //setShowInput(false);
      window.location.reload();
    }
  };

  return (
    <>
      {showInput ? (
        cloneElement(props.editEl, {
          value: iptVal,
          onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setIptVal(e.target.value),
          onKeyDown: (e: KeyboardEvent) => handleKeyDown(e.key),
          onBlur: () => setShowInput(false),
          className: "border border-gray-300 rounded px-2 py-1 w-full",
          autoFocus: true,
        })
      ) : (
        <div onClick={() => setShowInput(true)} className="cursor-pointer flex items-center gap-2">
          {props.children}
        </div>
      )}
    </>
  );
}

export interface EditParams {
  currVal: string,
  withIcon: ReactNode,
  editEl: ReactElement, 
  createBody: (newVal: string)=>Object, 
  trip: TripWithSignup,
  reqs: Requesters,
}

export function EditableComponent(props: EditParams) {
  return (
      <EditableString currVal={props.currVal} editEl={props.editEl} onSubmit={
        async (newVal: string) => { 
          props.reqs.backendPost(`/trip/${props.trip.id}/lead/alter`, props.createBody(newVal))
        }
      }>
        {props.withIcon}
      </EditableString>
    )
}

export const EditIcon = <PencilSquareIcon className="w-auto mb-1 h-5 inline text-boc_medbrown"/>;