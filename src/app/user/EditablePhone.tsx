import { useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline"; // Adjust import path if needed
import { AxiosResponse } from "axios";

function formatPhone(phoneNum: string): string {
    if (phoneNum.length > 10) return `+${phoneNum.slice(0,-10)} (${phoneNum.slice(-10, -7)}) ${phoneNum.slice(-7,-4)} ${phoneNum.slice(-4)}`
    else if (phoneNum.length == 10) return `(${phoneNum.slice(-10, -7)}) ${phoneNum.slice(-7,-4)} ${phoneNum.slice(-4)}`
    else return phoneNum
}

export default function EditablePhone({ currPhone, submitPhone }: {currPhone: string | null, submitPhone: (newPhone: string) => Promise<AxiosResponse<any, any>> }) {
  const [showInput, setShowInput] = useState(false);
  const [phone, setPhone] = useState(currPhone || "");

  const handleKeyDown = async (key: string) => {
    if (key === "Enter") {
      if (phone.length > 15) {
        alert("Phone number cannot be longer than 15 characters");
        setPhone("")
      } else {
        await submitPhone(phone);
        setShowInput(false);
      }
    }
  };

  return (
    <>
      {showInput ? (
        <input
          type="number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e.key)}
          onBlur={() => setShowInput(false)} // Optional: close input if user clicks away
          className="border border-gray-300 rounded px-2 py-1 w-full"
          autoFocus
        />
      ) : (
        <div
          onClick={() => setShowInput(true)}
          className="cursor-pointer flex items-center gap-2"
        >
          <u>{phone !== "" ? formatPhone(phone) : "Set phone"}</u>
          <PencilSquareIcon className="w-auto h-6" />
        </div>
      )}
    </>
  );
}