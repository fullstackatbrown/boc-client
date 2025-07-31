"use client";
import { useEffect, useState } from "react";
import { makeRequesters, AuthStat } from "@/scripts/requests";
import { signIn } from "next-auth/react";
import Login from "@/components/Login";
import BOCButton from "@/components/BOCButton";

export default function MailingList() {
  const [joined, setJoined] = useState<boolean|null>(null);
  const { backendPost, backendGet, sessionStatus } = makeRequesters();

  const handleSubmit = async () => {
    if (await sessionStatus() == AuthStat.Unauth) {
      await signIn("google")
    }
    backendPost("/user/listserv-add", {})
      .then((_): void => { window.location.reload(); })
      .catch((err): void => { 
        switch (err.status) {
          case (401): //Do nothing, user just isn't logged in, which is fine
            break;
          default:
            alert(`ERROR. You shouldn't be seeing this! Contact the website's admin and send them a picture of this message! ${err}`)
            console.log(err);
            break;
        }
      })
  };

  function checkListservStatus() {
    sessionStatus()
      .then((res) => {
        console.log(res)
        if (res == AuthStat.Unauth) setJoined(false) //User isn't logged in, so we don't know if they are signed up or not
        else {
          backendGet("/user/")
            .then((res): void => { setJoined(res.data.joinedListserv); })
            .catch((err): void => { console.log(err); })
        }
      })
      .catch((err) => { console.log(err); })
  }

  useEffect(checkListservStatus, []);
  if (joined === null) return <div className="text-center">Loading...</div>
  return (
    <div className="h-full w-full">
      {/* Dynamic spacer based on header height */}
      <div style={{ minHeight: `5px` }}></div>

      {/* Centered content with margin */}
      <div className="flex flex-col items-center mt-12 px-4">
        <p
          id="paragraph"
          className="text-xl font-light leading-8 mb-12 text-center max-w-2xl"
        >
          You will receive one weekly newsletter email informing you of the
          trips going out for the week. We don't spam—we promise! :-)
        </p>

        {/* Centered email form */}
        { joined 
          ? <div className="border-2 border-boc_medbrown p-4 rounded-2xl text-xl">
            Thanks for Signing Up!
          </div>
          : <BOCButton text="Join Listserv" onClick={handleSubmit}/>
        }
        {/* <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-full max-w-2xl"
        >
          <input
            type="email"
            placeholder="Enter your .edu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-4 rounded-lg w-full mb-4 max-w-md"
            required
            pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$"
            title="Please enter a .edu email address"
          />
        </form> */}
      </div>
    </div>
  );
}
