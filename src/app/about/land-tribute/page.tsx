"use client";
import Title from "@/components/Title";

import Image1 from "@/assets/images/about/riverlandacknowledgement.png";

export default function LandAcknowledgement() {
  return (
    <div className="h-full w-full px-6 sm:px-10 desktop:px-20 py-10">
      <Title text="Land Tribute" />

      {/* Text and image sit side by side only at desktop; below that the image
          would shrink to a postage stamp, so it stacks underneath instead */}
      <div id="content" className="text-center flex flex-col desktop:flex-row py-5">
        <div>
          <div>
            <h2
              id="paragraph"
              className="mb-8 text-base sm:text-lg font-light text-left leading-8 desktop:leading-9 italic text-grey-50"
              style={{ color: "#3b3b3b" }}
            >
              “Brown University is located in Providence, Rhode Island, on lands
              that are within the ancestral homelands of the Narragansett Indian
              Tribe. We acknowledge that beginning with colonization and
              continuing for centuries the Narragansett Indian Tribe have been
              dispossessed of most of their ancestral lands in Rhode Island by
              the actions of individuals and institutions. We acknowledge our
              responsibility to understand and respond to those actions. The
              Narragansett Indian Tribe, whose ancestors stewarded these lands
              with great care, continues as a sovereign nation today. We commit
              to working together to honor our past and build our future with
              the truth.”
            </h2>
          </div>
          <hr className="border-t-1.5 border-gray-300 w-24 mx-auto my-4" />
          <div
            id="paragraph"
            className="mb-8 text-lg desktop:text-xl font-[100] text-left leading-8 desktop:leading-10"
          >
            <p>
              {" "}
              As an Outing Club, where almost all of our activities relate to
              places and landscapes, remembering and respecting the people whose
              land we’re on is important.
            </p>
          </div>

          <div
            id="paragraph2"
            className="mb-8 text-lg desktop:text-xl font-[100] text-left leading-8 desktop:leading-10"
          >
            <p>
              {" "}
              This is Brown the Land Acknowledgement statement developed by
              Brown for use by the community; we realize that it is incomplete
              for our purposes as we venture away from campus, but we are still
              learning and developing a better practice.
            </p>
          </div>

          <div
            id="paragraph3"
            className="mb-8 text-lg desktop:text-xl font-[100] text-left leading-8 desktop:leading-10"
          >
            <p>
              {" "}
              Always feel free to reach out to us if you have any concerns,
              comments, or advice.
            </p>
          </div>
        </div>

        {/* Capped and centred on mobile; at desktop the cap lifts and flex-shrink
            sizes it as before */}
        <div className="pt-4 max-w-[20rem] mx-auto desktop:pt-0 desktop:pl-24 desktop:max-w-none desktop:mx-0">
          <img
            src={Image1.src}
            alt="A person standing in a river at sunset, arms raised"
            className="rounded-xl"
          ></img>
        </div>
      </div>
    </div>
  );
}
