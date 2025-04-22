"use client";
import NavBar from "@/components/NavBar";
import WhiteButton from "@/components/NatureButton";
import Title from "@/components/Title";
import AboutRiver from "@/assets/images/AboutRiver.png";

function Paragraph(props: { children: React.ReactNode }) {
  return (
    <div className="text-xl text-justify leading-10 mb-3">
      <p>{props.children}</p>
    </div>
  );
}

export default function About() {
  return (
    <div className="h-full min-h-screen w-full">
      <NavBar></NavBar>

      {/* Site content */}
      <Title text="About" />
      <div className="flex justify-center"></div>

      <div className="flex mx-20">
        <div className="text-center pr-8 w-3/4">
          <Paragraph>
            The BOC runs everything from
            <span className="font-bold"> local walks</span> to
            <span className="font-bold"> backpacking weekends,</span> to
            <span className="font-bold"> local bike rides,</span> to
            <span className="font-bold"> kayaking</span> to
            <span className="font-bold"> day hikes</span> to
            <span className="font-bold"> climbing</span> to
            <span className="font-bold"> skiing</span> and everything in
            between! The fall break and spring break
            <span className="font-bold"> backpacking</span> trips are the BOC’s
            longest trips, going to Adirondack, the Blue Ridge, and the White
            Mountains in recent years. Some of our most popular trips are our
            short walks and outdoor social events. Several subsidized
            <span className="font-bold"> ski trips</span> take place every
            winter, and local
            <span className="font-bold"> whitewater rafting</span> trips occur
            in the spring and fall.
          </Paragraph>

          <Paragraph>
            Every year, the club offers classes in climbing and backpacking
            skills. The BOC also runs periodic service trips to improve the
            public’s experience in the outdoors, especially in Rhode Island.
          </Paragraph>

          <Paragraph>
            If you’re interested in the community, challenge, and regeneration
            that the outdoors offer, join our mailing list that includes over
            3,000 members of the Brown community—faculty, graduate students, and
            undergraduate students included. If you’d like to support our
            mission of getting more students outside, click here to donate to
            the BOC!
          </Paragraph>
        </div>
        <img src={AboutRiver.src} className="w-3/5 mx-auto mb-8" />
      </div>
      <div className="text-center mt-8 mb-8 flex justify-center gap-4">
        <WhiteButton
          onClick={handleLandClick}
          text="Land Acknowledgement"
        ></WhiteButton>
        <WhiteButton
          onClick={handleTeamClick}
          text="Meet Our Team!"
        ></WhiteButton>
        <WhiteButton
          onClick={handleMailClick}
          text="Join Our Mailing List!"
        ></WhiteButton>
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
