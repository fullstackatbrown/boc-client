// "use client"

// import { TripParticipant, TripWithSignup } from '@/models/models';
// import { Requesters } from '@/scripts/requests';
// import { AxiosError } from 'axios';
// import React, { useEffect, useState } from 'react';

// interface AttendanceFormProps {
//   trip: TripWithSignup;
//   reqs: Requesters
// }

// function handleNetError(err: AxiosError) {
//   console.error(err);
//   alert(`You should not be seeing this error! Please contact this site's web admin at william_l_stone@brown.edu or alan_wang2@brown.edu and send them this message along with how you encountered it. ERROR: ${err}`);
// }

// const AttendanceForm: React.FC<AttendanceFormProps> = ({ trip, reqs }) => {
//   // const participants: TripParticipant[] = [
//   //   {
//   //     firstName: "William",
//   //     lastName: "Stone",
//   //     email: "william_l_stone@brown.edu",
//   //     status: "Selected",
//   //     confirmed: true,
//   //     paid: true,
//   //   },
//   //   {
//   //     firstName: "Test",
//   //     lastName: "Dude",
//   //     email: "test_dude@brown.edu",
//   //     status: "Selected",
//   //     confirmed: true,
//   //     paid: false,
//   //   }
//   // ];

//   // const emailOptions = [
//   //   "william_l_stone@brown.edu",
//   //   "test_dude@brown.edu",
//   //   "extra1@brown.edu",
//   //   "extra2@brown.edu",
//   //   "extra3@brown.edu"
//   // ];
//   const [participants, setParticipants] = useState<TripParticipant[]>([]);
//   const [emailOptions, setEmailOptions] = useState<string[]>([]);
//   const [selectedParticipants, setSelectedParticipants] = useState<Record<string, boolean>>({});
//   const [emailInputs, setEmailInputs] = useState<string[]>(['']);
//   const [showDropdown, setShowDropdown] = useState<boolean[]>([false]);
//   const { backendGet, backendPost } = reqs;

//   // ✅ Compute filtered options on the fly instead of storing them in state
//   const getFilteredOptions = (index: number) => {
//     const value = emailInputs[index] || "";
//     const participantEmails = participants.map(p => p.email);
//     const usedEmails = new Set([...participantEmails, ...emailInputs.filter((_, i) => i !== index)]);

//     return emailOptions.filter(option =>
//       option.toLowerCase().includes(value.toLowerCase()) &&
//       !usedEmails.has(option)
//     );
//   };

//   const handleParticipantChange = (email: string) => {
//     setSelectedParticipants(prev => ({
//       ...prev,
//       [email]: !prev[email],
//     }));
//   };

//   const handleEmailInputChange = (index: number, value: string) => {
//     const newInputs = [...emailInputs];
//     const participantEmails = participants.map(p => p.email);
//     const otherInputs = newInputs.filter((_, i) => i !== index);

//     // Auto-clear if duplicate manually typed
//     if (participantEmails.includes(value.trim()) || otherInputs.includes(value.trim())) {
//       newInputs[index] = "";
//     } else {
//       newInputs[index] = value.trim();
//     }

//     setEmailInputs(newInputs);
//   };

//   const handleAddEmailInput = () => {
//     setEmailInputs([...emailInputs, '']);
//     setShowDropdown([...showDropdown, false]);
//   };

//   const handleRemoveEmailInput = () => {
//     if (emailInputs.length > 1) {
//       setEmailInputs(emailInputs.slice(0, -1));
//       setShowDropdown(showDropdown.slice(0, -1));
//     }
//   };

//   const handleSelectEmail = (index: number, email: string) => {
//     const newInputs = [...emailInputs];
//     newInputs[index] = email;
//     setEmailInputs(newInputs);

//     const newShowDropdown = [...showDropdown];
//     newShowDropdown[index] = false;
//     setShowDropdown(newShowDropdown);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     //const signedUpEmails = participants.filter(p => selectedParticipants[p.email]).map(p => p.email);
//     const additionalEmails = emailInputs.filter(e => e);

//     //TO BE COMPLETED LATER:
//     const attendanceJson = {
//       selectedParticipants: {},
//       additionalParticipants: additionalEmails,
//     }
//     backendPost(`/trip/${trip.id}/lead/attendance`, attendanceJson)
//       .catch(handleNetError);
//   };

//   useEffect(() => {
//     backendGet(`/trip/${trip.id}/lead/participants`)
//       .then((res) => setParticipants(res.data))
//       .catch((err) => handleNetError(err))
//     backendGet(`/trip/${trip.id}/lead/all-possible-participants`)
//       .then((res) => setEmailOptions(res.data))
//       .catch((err) => handleNetError(err))
//   }, [])

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div>
//         <h3 className="text-lg font-semibold mb-2">Signed Up Participants</h3>
//         <ul className="grid grid-cols-2 gap-2">
//           {participants.map(p => (
//             <li key={p.email} className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 className="h-4 w-4"
//                 checked={!!selectedParticipants[p.email]}
//                 onChange={() => handleParticipantChange(p.email)}
//               />
//               <label className="text-sm">
//                 {p.firstName} {p.lastName} <span className="text-gray-500">({p.email})</span>
//               </label>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div>
//         <h3 className="text-lg font-semibold mb-2">Additional Participants</h3>
//         {emailInputs.map((value, index) => {
//           const options = getFilteredOptions(index);
//           return (
//             <div key={index} className="relative mb-4">
//               <input
//                 type="text"
//                 value={value}
//                 onChange={e => handleEmailInputChange(index, e.target.value)}
//                 onFocus={() => {
//                   const newShow = [...showDropdown];
//                   newShow[index] = true;
//                   setShowDropdown(newShow);
//                 }}
//                 onBlur={() => {
//                   setTimeout(() => {
//                     const newShow = [...showDropdown];
//                     newShow[index] = false;
//                     setShowDropdown(newShow);
//                   }, 150);
//                 }}
//                 placeholder="Enter Participant Email"
//                 className="w-full border rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               {showDropdown[index] && options.length > 0 && (
//                 <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow mt-1 max-h-36 overflow-y-auto">
//                   {options.map(option => (
//                     <li
//                       key={option}
//                       className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
//                       onClick={() => handleSelectEmail(index, option)}
//                     >
//                       {option}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           );
//         })}

//         <div className="flex gap-3">
//           <button
//             type="button"
//             onClick={handleAddEmailInput}
//             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
//           >
//             Add Email
//           </button>
//           <button
//             type="button"
//             onClick={handleRemoveEmailInput}
//             className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
//           >
//             Remove Email
//           </button>
//         </div>
//       </div>

//       <div>
//         <button
//           type="submit"
//           className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
//         >
//           Submit
//         </button>
//       </div>
//     </form>
//   );
// };

// export default AttendanceForm;
"use client"

import { TripParticipant, TripWithSignup } from '@/models/models';
import { Requesters } from '@/scripts/requests';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';

interface AttendanceFormProps {
  trip: TripWithSignup;
  reqs: Requesters
}

function handleNetError(err: AxiosError) {
  console.error(err);
  alert(`You should not be seeing this error! Please contact this site's web admin at william_l_stone@brown.edu or alan_wang2@brown.edu and send them this message along with how you encountered it. ERROR: ${err}`);
}

// ✅ Enum for attendance status
export enum AttendanceStatus {
  Attended = "Attended",
  ExcusedAbsence = "Excused Absence",
  NoShow = "No Show",
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ trip, reqs }) => {
  const [participants, setParticipants] = useState<TripParticipant[]>([]);
  const [emailOptions, setEmailOptions] = useState<string[]>([]);
  const [participantStatuses, setParticipantStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [emailInputs, setEmailInputs] = useState<string[]>(['']);
  const [showDropdown, setShowDropdown] = useState<boolean[]>([false]);
  const { backendGet, backendPost } = reqs;

  // ✅ Compute filtered options on the fly
  const getFilteredOptions = (index: number) => {
    const value = emailInputs[index] || "";
    const participantEmails = participants.map(p => p.email);
    const usedEmails = new Set([...participantEmails, ...emailInputs.filter((_, i) => i !== index)]);

    return emailOptions.filter(option =>
      option.toLowerCase().includes(value.toLowerCase()) &&
      !usedEmails.has(option)
    );
  };

  const handleStatusChange = (email: string, status: AttendanceStatus) => {
    setParticipantStatuses(prev => ({
      ...prev,
      [email]: status,
    }));
  };

  const handleEmailInputChange = (index: number, value: string) => {
    const newInputs = [...emailInputs];
    const participantEmails = participants.map(p => p.email);
    const otherInputs = newInputs.filter((_, i) => i !== index);

    if (participantEmails.includes(value.trim()) || otherInputs.includes(value.trim())) {
      newInputs[index] = "";
    } else {
      newInputs[index] = value.trim();
    }

    setEmailInputs(newInputs);
  };

  const handleAddEmailInput = () => {
    setEmailInputs([...emailInputs, '']);
    setShowDropdown([...showDropdown, false]);
  };

  const handleRemoveEmailInput = () => {
    if (emailInputs.length > 1) {
      setEmailInputs(emailInputs.slice(0, -1));
      setShowDropdown(showDropdown.slice(0, -1));
    }
  };

  const handleSelectEmail = (index: number, email: string) => {
    const newInputs = [...emailInputs];
    newInputs[index] = email;
    setEmailInputs(newInputs);

    const newShowDropdown = [...showDropdown];
    newShowDropdown[index] = false;
    setShowDropdown(newShowDropdown);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const additionalEmails = emailInputs.filter(e => e);

    const attendanceJson = {
      selectedParticipants: participantStatuses,
      additionalParticipants: additionalEmails,
    };

    backendPost(`/trip/${trip.id}/lead/attendance`, attendanceJson)
      .then(() => window.location.reload())
      .catch(handleNetError);
  };

  useEffect(() => {
    backendGet(`/trip/${trip.id}/lead/participants`)
      .then((res) => {
        setParticipants(res.data);
        // initialize all participants with "No Show"
        const initialStatuses: Record<string, AttendanceStatus> = {};
        res.data.forEach((p: TripParticipant) => {
          initialStatuses[p.email] = AttendanceStatus.NoShow;
        });
        setParticipantStatuses(initialStatuses);
      })
      .catch((err) => handleNetError(err));

    backendGet(`/trip/${trip.id}/lead/all-possible-participants`)
      .then((res) => setEmailOptions(res.data))
      .catch((err) => handleNetError(err));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Signed Up Participants */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Signed Up Participants</h3>
        <ul className="space-y-2">
          {participants.map(p => (
            <li key={p.email} className="flex items-center justify-between gap-2 border-b pb-1">
              <span className="text-sm">
                {p.firstName} {p.lastName} <span className="text-gray-500">({p.email})</span>:
              </span>
              <select
                value={participantStatuses[p.email] || AttendanceStatus.NoShow}
                onChange={(e) => handleStatusChange(p.email, e.target.value as AttendanceStatus)}
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(AttendanceStatus).map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </div>

      {/* Additional Participants */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Additional Participants</h3>
        {emailInputs.map((value, index) => {
          const options = getFilteredOptions(index);
          return (
            <div key={index} className="relative mb-4">
              <input
                type="text"
                value={value}
                onChange={e => handleEmailInputChange(index, e.target.value)}
                onFocus={() => {
                  const newShow = [...showDropdown];
                  newShow[index] = true;
                  setShowDropdown(newShow);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    const newShow = [...showDropdown];
                    newShow[index] = false;
                    setShowDropdown(newShow);
                  }, 150);
                }}
                placeholder="Enter Participant Email"
                className="w-full border rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showDropdown[index] && options.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow mt-1 max-h-36 overflow-y-auto">
                  {options.map(option => (
                    <li
                      key={option}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                      onClick={() => handleSelectEmail(index, option)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAddEmailInput}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Add Email
          </button>
          <button
            type="button"
            onClick={handleRemoveEmailInput}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Remove Email
          </button>
        </div>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default AttendanceForm;
