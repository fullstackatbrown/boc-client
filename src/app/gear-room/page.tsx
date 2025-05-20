"use client";
import Title from "@/components/Title";
import Schedule from "./schedule"

function Subheading(props: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl font-bold mb-5 mt-10">{props.children}</h1>
  )
}

function Paragraph(props: { children: React.ReactNode }) {
  return (
    <div className="text-xl font-[100] text-justify leading-10 mb-3">
      <p>{props.children}</p>
    </div>
  );
}

export default function GearRoom() {
  return (
    <div className="h-full min-h-screen w-full">
      <Title text="Gear Room" />

      {/* Site content */}

      <div className="p-14 pt-0">
        <Paragraph>
          The BOC has a gear room in the ground floor of the Campus Center
          (directions below), where we have a large selection of outdoor gear.
          We use these items for the trips we sponsor, but we also offer the
          opportunity for students to rent out gear from us. If you’re
          interested in renting gear for your own trip with friends, we also
          provide consulting about what you might need, how to plan your trip,
          and any other questions. If you’re interested in renting gear, or just
          want to come see our selection and learn about how to use things, come
          visit our gear room during open hours!
        </Paragraph>
        <Subheading>Gear Room Open Hours</Subheading>
        <div className="flex">
        <div className="w-1/3">
        <Paragraph>
          Come stop by our gear room and chat with gear room managers or other
          club leaders! We’re here to answer any questions you might have about
          what gear and services we provide, how to use it, and what we do!
          These are our hours for the semester; however, hours can be in flux
          week-by-week. Make sure to check our This Week Outside email each week
          for exact updates!
        </Paragraph>
        </div>
        <div className="w-2/3 pl-10">
          <Schedule />
        </div>
        </div>
        <Subheading>How do I rent gear?</Subheading>
        <Paragraph>
          BOC gear is available for personal use by any Brown community member.
          To check out gear, follow these steps:
        </Paragraph>
        <div className="pl-10">
        <Paragraph>
          1. Come by our office in the basement of Faunce (directions below)
          during gear room hours (should be on the right of the website header).
        </Paragraph>
        <Paragraph>
          2. Find the gear that you want to check out (see partial list below).
        </Paragraph>
        <Paragraph>
          3. Fill out a contact sheet with your name, information, and the days
          that you plan to use the gear.
        </Paragraph>
        <Paragraph>
          4. Please bring cash in the amount of the gear rental fees below. All
          gear rentals are, by default, one week pending availability. We do not
          accept credit card or Venmo. We will only collect the retail value of
          the gear if it is returned late, dirty, damaged, lost, or stolen.
        </Paragraph>
        <Paragraph>
          5. By renting gear from the Brown Outing Club, you agree to all of our
          Gear Room Policies.
        </Paragraph>
        <Paragraph>6. Have a fun trip!</Paragraph>
        </div>

        <Subheading>Directions to the BOC Gear Room</Subheading>
        <Paragraph>
          Click on the tab “Where is the Gear Room?” for video directions! Go
          into Faunce House and head down to the bottom floor. Turn so that
          you’re walking east (toward Thayer St.), and walk through the orange
          hallway to the Kasper Multipurpose Room (a big room at the end of that
          hallway). Keep walking across the multipurpose room and into a small
          hallway in the back right corner of the room. The BOC office is on
          your right.
        </Paragraph>
        <Subheading>More Questions?</Subheading>
        <Paragraph>
          If you have any more questions regarding gear rental or our inventory,
          please email us at outing@brown.edu or contact our gear room managers
          Cate & Ayo at: ifadayo_engel-halfkenny@brown.edu and
          catherine_latimer@brown.edu
        </Paragraph>
      </div>
    </div>
  );
}
