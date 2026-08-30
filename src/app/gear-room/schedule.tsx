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
            {/* Three columns don't fit a phone, and INFO is usually empty. Below sm it
                drops out and any info folds into a second line under the hours instead. */}
            <Th className="hidden sm:table-cell">INFO</Th>
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
        {day.info && <span className="block sm:hidden italic">{day.info}</span>}
      </Td>
      <Td className="hidden sm:table-cell">{day.info ? day.info : ""}</Td>
    </tr>
  );
}

function Td(props: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`border-boc_green rounded-lg p-[5px] text-left text-boc_darkbrown border-2 ${props.className ?? ""}`}>
      {props.children}
    </td>
  );
}

function Th(props: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`border-boc_green rounded-t-lg p-[5px] bg-green-100
    text-center text-boc_darkbrown border-2 ${props.className ?? ""}`}
    >
      {props.children}
    </th>
  );
}

