"use client";
import Title from "@/components/Title";
import Dropdown from "@/components/Dropdown";

import Rafting from "@/assets/images/about/rafting.jpg";
import { useEffect, useState } from "react";
import db from "@/scripts/firebase";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { loadCoreSlots } from "../our-team/coreLeadership";

export default function LandAcknowledgement() {
  const [treasurers, setTreasurers] = useState<string>("loading...");
  const [email, setEmail] = useState<string>("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        //Whoever currently holds the two treasurer slots, rather than two team docs named
        //after the slots - so handing the role over is a change to `core`, not to this page.
        const slots = await loadCoreSlots();
        const ids = ["treasurer1", "treasurer2"].flatMap(
          (slot) => slots.find((s) => s.id === slot)?.leader ?? []
        );
        const [treasurer1, treasurer2] = (
          await Promise.all(ids.map((id) => getDoc(doc(db, "team", id))))
        ).map((snap) => snap.data());

        if (!(treasurer1 && treasurer2)) throw new Error("Unable to find the treasurer data");
        else {
          setTreasurers(` ${treasurer1.name} and ${treasurer2.name} `);
          setEmail(`${treasurer1.email};${treasurer2.email}`);
        }
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="h-full w-full px-6 sm:px-10 desktop:px-20 pt-10 pb-5">
      <Title text="Financial Aid" />
      <div id="content" className="text-center flex flex-col desktop:flex-row py-5">
        <p className="text-lg font-light text-left leading-9 text-grey-50 break-words" style={{ color: "#3b3b3b" }}>
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
          {treasurers} [<a href={`mailto:${email}`} className="underline">email us!</a>].
        </p>
        {/* <hr className="border-t-1.5 border-gray-300 w-24 mx-auto my-4" /> */}
        {/* Stacked above the text on mobile so the photo isn't buried below the copy,
            and cropped full-bleed to a banner there (matching the About page) rather
            than running the full portrait height. */}
        <div className="order-first w-full mb-6
        desktop:order-none desktop:w-auto desktop:max-w-none desktop:mb-0 desktop:pl-24 desktop:flex-shrink-0">
          <img
            src={Rafting.src}
            alt="BOC members rafting a river in autumn"
            className="rounded-xl w-full max-h-[220px] object-cover desktop:w-96 desktop:max-h-none"
          ></img>
        </div>
      </div>
      <Dropdown header="Promo Codes" content={
        <p className="py-2">BOC25: 25% aid, BOC50: 50% aid, BOC75: 75% aid, BOC100: 100% aid</p>
      }/>
    </div>
  );
}
