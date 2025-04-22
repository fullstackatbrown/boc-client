"use client";
import NavBar from "@/components/NavBar";
import { useState } from "react";

export default function MailingList() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add email submission logic here, e.g., API call
    console.log("Email submitted:", email);
  };

  return (
    <div className="h-full min-h-screen w-full">
      <NavBar />
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
        <form
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
        </form>
      </div>
    </div>
  );
}
