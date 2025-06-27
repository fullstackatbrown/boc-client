"use client";
import Title from "@/components/Title";
import Dropdown from "@/components/Dropdown";

import Rafting from "@/assets/images/about/rafting.jpg";

export default function LandAcknowledgement() {
  return (
    <div className="h-full w-full px-20 pt-10 pb-5">
      <Title text="Financial Aid" />
      <div id="content" className="text-center flex py-5">
        <p className="text-lg font-light text-left leading-9 text-grey-50" style={{ color: "#3b3b3b" }}>
          Excited about a trip offering but hesitant to sign up because of the cost? 
          <br/><br/>
          We understand that many outdoors-related sports and activities have high costs, and we don't 
          want that to be a barrier to any student who is interested in joining our trips. We believe 
          that the outdoors is a space that has been made inaccessible to many people for too long, and we 
          hope to do what we can to bring about a change in that.
          <br/><br/>
          Because of this, we offer full (or partial) financial aid on all of our trips, no questions asked. If cost 
          ever feels like a factor in whether or not you sign up for one of our trips, don't let it be! 
          <br/><br/>
          This model, however, is only sustainable with the help of those for whom cost is less of a barrier; we urge
          all participants to pay as much as they feel is reasonable for them. 
          <br/><br/>
          To use financial aid, you may apply the promo codes below at checkout when paying for a trip. Even if you opt 
          for full aid, please go through the payment process anyways (we need it for our records and we might pester you 
          about payment if we don't have it!).
          <br/><br/>
          For questions about financial aid or reimbursements (or anything really!), please reach out to our treasurers 
          William Stone and Alex Tully [<a href="mailto:william_l_stone@brown.edu;alexander_tully@brown.edu" className="underline">email us!</a>].
        </p>
        {/* <hr className="border-t-1.5 border-gray-300 w-24 mx-auto my-4" /> */}
        <div className="pl-24 flex-shrink-0">
          <img src={Rafting.src} className="rounded-xl w-96"></img>
        </div>
      </div>
      <Dropdown header="Promo Codes" content={
        <p className="py-2">BOC25: 25% aid, BOC50: 50% aid, BOC75: 75% aid, BOC100: 100% aid</p>
      }/>
    </div>
  );
}
