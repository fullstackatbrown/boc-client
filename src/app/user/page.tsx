"use client";
import NavBar from "@/components/NavBar";
import WhiteWaterBanner from "@/components/WhiteWaterBanner";

function Subheading(props: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-bold mb-5 mt-10">{props.children}</h1>;
}

function Paragraph(props: { children: React.ReactNode }) {
  return (
    <div className="text-xl font-[100] text-left leading-10 mb-3">
      <p>{props.children}</p>
    </div>
  );
}

export default function User() {
  return (
    <div className="h-full min-h-screen w-full">
      <NavBar></NavBar>

      {/* Site content */}
      <WhiteWaterBanner text="USER"></WhiteWaterBanner>
    </div>
  );
}
