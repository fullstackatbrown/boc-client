"use client";
import NavBar from "@/components/NavBar";
import WhiteWaterBanner from "@/components/WhiteWaterBanner";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

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
  const [userProfile, setUserProfile] = useState({
    name: "",
    role: "",
    email: "",
    phoneNum: "",
    tripsParticipated: "",
  });
  const updateLogin = async () => {
    try {
      const { data: userData } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/user/profile`,
        {
          headers: {
            token: localStorage.getItem("access_token"),
          },
        }
      );

      setUserProfile({
        name: `${userData.firstName} ${userData.lastName}`,
        role: `${userData.role} `,
        email: `${userData.email} `,
        phoneNum: `${userData.phone} `,
        tripsParticipated: `${userData.tripsParticipated} `,
      });
    } catch (error) {
      setUserProfile({
        name: "",
        role: "",
        email: "",
        phoneNum: "",
        tripsParticipated: "",
      });
      console.log("ERROR");
    }
  };

  useEffect(() => {
    updateLogin();
  }, []);

  return (
    <div className="h-full min-h-screen w-full">
      <NavBar></NavBar>

      {/* Site content */}
      <WhiteWaterBanner text="User Profile"></WhiteWaterBanner>

      <div id="content" className="flex justify-center items-start gap-10 p-5">
        <div className="w-60 aspect-square flex justify-center rounded-lg object cover bg-gray-200">
          <img alt="User Profile" className="w-1/2 rounded-lg object cover" />
        </div>
        <div className="text-[1.200rem] leading-loose">
          <div>
            <b>Name: </b>
            {userProfile.name}
          </div>
          <div>
            {" "}
            <b>BOC Position:</b> {userProfile.role}
          </div>
          <div>
            <b>E-mail:</b> {userProfile.email}
          </div>
          <div>
            <b>Phone Number: </b>
            {userProfile.phoneNum}
          </div>
        </div>
        <div
          style={{ backgroundColor: "#5CB85B" }}
          className="w-1/4 text-center rounded-lg shadow-md"
        >
          <p className="text-2xl font-bold text-white pt-7">Summit Seeker</p>
          <hr className="border-t-2 border-white w-full my-4" />

          <div className="pb-7">
            <p
              style={{ color: "#FFFFFFBF" }}
              className="text-2xl font-bold text-white"
            >
              Total Trips:
            </p>
            <p className="text-3xl font-bold text-white">
              {userProfile.tripsParticipated}
            </p>
          </div>
        </div>
        <div
          style={{ backgroundColor: "#5CB85B" }}
          className="w-1/4 text-center rounded-lg shadow-md"
        >
          <p className="text-2xl font-bold text-white pt-7">Novice</p>
          <hr className="border-t-2 border-white w-full my-4" />

          <div className="pb-7">
            <p
              style={{ color: "#FFFFFFBF" }}
              className="text-2xl font-bold text-white"
            >
              Total Trip Types:
            </p>
            <p className="text-3xl font-bold text-white">
              {userProfile.tripsParticipated} / 24
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
