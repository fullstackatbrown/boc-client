"use client";
import NavBar from "@/components/NavBar";
import WhiteWaterBanner from "@/components/WhiteWaterBanner";

function Subheading(props: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl font-bold mb-5 mt-10">{props.children}</h1>
  )
}

function Paragraph(props: { children: React.ReactNode }) {
  return (
    <div className="text-xl font-[100] text-left leading-10 mb-3">
      <p>{props.children}</p>
    </div>
  );
}

export default function Trips() {
  return (
    <div className="h-full min-h-screen w-full">
      <NavBar></NavBar>

      {/* Site content */}
      <WhiteWaterBanner text="TRIPS"></WhiteWaterBanner>
      {/* Title and Description */}
      <section className="p-8">
        <h1 className="text-5xl font-bold text-black">BOC Trips Calendar</h1>
        <hr className="my-4 border-t-2 border-black" />
        <p className="text-black text-xl">
          This is a description about the page.
        </p>

        {/* Upcoming Trips Heading */}
        <h2 className="text-4xl font-bold text-black mt-8">Upcoming Trips</h2>

        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse border border-black">
            {/* Table Head */}
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black px-4 py-2">Name</th>
                <th className="border border-black px-4 py-2">Date</th>
                <th className="border border-black px-4 py-2">Description</th>
                <th className="border border-black px-4 py-2">Date</th>
                <th className="border border-black px-4 py-2">Leaders</th>
              </tr>
            </thead>

            {/* Table Body (5 Rows) */}
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-black px-4 py-2">Trip {index + 1}</td>
                  <td className="border border-black px-4 py-2">MM/DD/YYYY</td>
                  <td className="border border-black px-4 py-2">Trip description here</td>
                  <td className="border border-black px-4 py-2">MM/DD/YYYY</td>
                  <td className="border border-black px-4 py-2">Leader Name</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
