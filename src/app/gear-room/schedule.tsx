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

// function Td(props: { children: React.ReactNode }) {
//   return <td className="p-[0.24em]">{props.children}</td>;
// }

// // create a table for all upcoming trips
// function tripTable(tripsType: String, trips: Trip[]) {
//   return (
//     <div className="flex flex-col mb-10">
//       <div className="flex justify-center pt-5">
//         { trips.length > 0 ? 
//           <table className="table-fixed w-full border-separate border-spacing-2">
//             <colgroup>
//               <col style={{ width: "60%" }} />
//               <col style={{ width: "20%" }} />
//               <col style={{ width: "20%" }} />
//             </colgroup>
//             <tbody>
//               <tr className="px-4 py-2 text-center font-bold">
//                 <Th>Trip Title</Th>
//                 <Th>Date</Th>
//                 <Th>Lottery Info</Th>
//               </tr>
//               { trips.map((data, index) => (
//                 <TripRow key={index} {...data} />
//               ))}
//             </tbody>
//           </table>
//           : <p className="w-full text-center border-2 border-dashed border-boc_green rounded-lg p-8 text-2xl text-gray-500">None Yet!</p>
//         }
//       </div>
//     </div>
//   );
// }

export default function Schedule() {
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
            <Th>DAY</Th>
            <Th>HOURS</Th>
            <Th>INFO</Th>
          </tr>
          {dates.map((day, _index) => (
            <DayRow key={day.day} day={day} />
          ))}
        </tbody>
      </table>
      {/* <table className="table-fixed w-full max-w-5xl text-2xl">
        <tbody className="divide-y divide-black">
          <tr className="divide-x divide-black px-4 py-2 text-center font-bold">
            <Td>DAY</Td>
            <Td>HOURS</Td>
            <Td>INFO</Td>
          </tr>
          {dates.map((day, index) => (
            <DayRow key={day.day} day={day} />
          ))}
        </tbody>
      </table> */}
    </div>
  );
}

function DayRow({ day }: { day: Day }) {
  return (
    <tr className="px-4 py-2 text-center">
      <Td>{day.day}</Td>
      <Td>
        {day.hours.slice(0, -1).map((hour, index) => (
          <span key={hour}>{hour} &&nbsp;</span>
        ))}
        {day.hours.slice(-1).map((hour, index) => (
          <span key={hour}>{hour}</span>
        ))}
      </Td>
      <Td>{day.info ? day.info : ""}</Td>
    </tr>
  );
}

function Td(props: { children: React.ReactNode }) {
  return (
    <td className="border-boc_green rounded-lg p-[5px] text-left text-boc_darkbrown border-2">
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

