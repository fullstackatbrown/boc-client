"use client";
import BOCButton from "@/components/BOCButton";
import Title from "@/components/Title";
import Image1 from "@/assets/images/about/main.png";

function Paragraph(props: { children: React.ReactNode }) {
  return (
    <div className="text-justify pb-5 text-[24px]">
      <p>{props.children}</p>
    </div>
  );
}

export default function About() {
  return (
    <div className="h-full w-full px-20 py-10">
      {/* Site content */}
      <Title text="About" />
      <div className="flex space-x-10">
        <div className="text-center max-w-[70%]">
          <Paragraph>
            The BOC organizes everything from local walks and bike rides to
            weekend backpacking, kayaking, skiing, and climbing trips! Our
            longest adventures happen over fall and spring break, with recent
            destinations like the Adirondacks, Blue Ridge, and White Mountains.
            Popular trips include short walks and outdoor socials, plus
            subsidized ski trips each winter and whitewater rafting in spring
            and fall.
          </Paragraph>

          <Paragraph>
            We offer climbing and backpacking classes each year and run service
            trips to improve outdoor spaces, especially around Rhode Island.
            This year, we’re reviving movie nights, lectures, and workshops on
            outdoor topics.
          </Paragraph>

          <Paragraph>
            If you’re drawn to the outdoors for community, challenge, or
            renewal, join our 3,000+ member mailing list of students, faculty,
            and staff. Want to support our mission? Donate to the BOC!
          </Paragraph>
        </div>
        <div>
          <img src={Image1.src} className="rounded-xl h-auto" />
        </div>
      </div>
      <div className="bg-[#dedeae] rounded-2xl mt-10 p-8 shadow-md mx-auto">
        <p className="text-lg font-semibold mb-6">
          We, the Board of the Brown Outing Club, will abide by the following
          values, and use them as guiding principles for the short and long-term
          goals of the club (F.A.C.E.S.):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 text-[#3f9135] font-semibold text-3xl">
          <div>
            <h2>Fun</h2>
            <p className="text-black font-normal text-base mt-2">
              afford the Brown community with safe and enjoyable recreation and
              social interaction where participants can be themselves, take
              healthy risks, and find a change of pace from the campus
              environment;
            </p>
          </div>
          <div>
            <h2>Accessibility</h2>
            <p className="text-black font-normal text-base mt-2">
              acknowledge the myriad of barriers to outdoor recreation and
              facilitate access for Brown community members of all identities,
              backgrounds, experience levels, and financial circumstances;
              actively reach individuals and groups who might not otherwise get
              outside;
            </p>
          </div>
          <div>
            <h2>Community</h2>
            <p className="text-black font-normal text-base mt-2">
              foster social interaction and interpersonal connection by
              encouraging collaboration and creating an inclusive, synergistic
              relationship between leaders and participants;
            </p>
          </div>
          <div>
            <h2>Experience</h2>
            <p className="text-black font-normal text-base mt-2">
              craft spaces in which leaders and participants can have meaningful
              interactions with themselves, their peers, and the surrounding
              environment;
            </p>
          </div>
          <div className="md:col-span-2 flex justify-center">
            <div className="w-[50%]">
              <h2>Service</h2>
              <p className="text-black font-normal text-base mt-2">
                serve the Brown community by providing opportunities to get off
                campus and develop skills in a variety of outdoor pursuits;
                instill respect for natural places, a commitment to Leave No
                Trace ethics, and best practices for environmental stewardship.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const handleMailClick = () => {
  window.location.href = "/about/mailing-list";
};

const handleLandClick = () => {
  window.location.href = "/about/land-acknowledgement";
};

const handleTeamClick = () => {
  window.location.href = "/about/meet-our-team";
};

const handleMissionClick = () => {
  window.location.href = "/about/our-mission";
};
