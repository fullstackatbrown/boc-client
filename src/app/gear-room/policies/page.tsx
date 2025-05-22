"use client";
import Title from "@/components/Title";
import Schedule from "./schedule";

function Subheading(props: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-bold mb-5 mt-10">{props.children}</h1>;
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
    <div className="h-full w-full px-20 py-10">
      <Title text="Gear Room Policies" />

      {/* Site content */}

      <div>
        <Paragraph>
          You assume all risk from using our gear. All gear is for personal use.
          If you don’t know how to use our gear, don’t use our gear until you
          know how to. Let us know ASAP if there’s a problem with our gear. Only
          return gear during our posted hours. Make sure your gear is clean when
          you return it, otherwise we’ll charge you. If the gear is returned
          late, we’ll charge you twice the rental fee for each week it’s late.
          If the gear is lost, stolen, or damaged, we’ll charge you up to the
          full value of the gear. For any unpaid fines or if you ghost us, we’ll
          send your name to Student Conduct.
        </Paragraph>

        <Paragraph>
          In legalese: The Brown Outing Club (BOC) owns equipment and gear that
          is available for the use and benefit of the Brown community. In
          consideration for the benefits received, the Brown community member
          renting gear (hereafter referred to as “User”) assumes all risk for
          any damages or injuries that may be sustained to either person or
          property while using BOC equipment. BOC equipment may be used solely
          in accordance with the following conditions:
        </Paragraph>
      </div>
    </div>
  );
}
