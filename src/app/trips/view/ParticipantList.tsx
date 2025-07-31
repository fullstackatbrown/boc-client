import { TripParticipant, TripStatus, TripWithSignup } from "@/models/models";

type Day = {
    day: string;
    hours: string[];
    info?: string;
  };
  
  let dates: Day[] = [
    {
      day: "Monday",
      hours: ["2pm - 4pm"],
      info: "Gas Available (3pm - 4pm)",
    },
    { day: "Tuesday", hours: ["11am - 4pm", "5pm - 6pm"] },
    { day: "Wednesday", hours: ["7:30pm - 8:30pm"] },
    { day: "Thursday", hours: ["4:30pm - 5:30pm"], info: "Gas Available" },
    { day: "Friday", hours: ["4pm - 5pm"], info: "Gas Available" },
  ];
  
  export default function ParticipantList({ trip, participants }:{ trip: TripWithSignup, participants: TripParticipant[] }) {
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
              <ParticipantRow key={index} part={part} extraData={extraData} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  function ParticipantRow({ part, extraData }: { part: TripParticipant, extraData: boolean }) {
    return (
      <tr className="px-4 py-2 text-center">
        <Td>{part.firstName} {part.lastName}</Td>
        <Td>{part.email}</Td>
        { extraData 
        ? <>
          <Td>{part.confirmed ? "Yup!" : "Not Yet..."}</Td>
          <Td>{part.paid ? "Yup!" : "Not Yet..."}</Td>
        </>
        : <></>
        }
      </tr>
    );
  }
  
  function Td(props: { children: React.ReactNode }) {
    return (
      <td className="border-boc_green rounded-lg p-[5px] text-center text-boc_darkbrown border-2">
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