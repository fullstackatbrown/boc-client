export type Day = {
  day: string;
  hours: string[];
  info?: string;
};

export default function Schedule({ dates }:{ dates: Day[] }) {
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

