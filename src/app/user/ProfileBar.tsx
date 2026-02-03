import { User } from "@/models/models"
import tripsBadge from "@/assets/images/profile/badge.png";
import profilepic from "@/assets/images/profile/bear.png";
import wood from "@/assets/images/profile/wood.png";
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { AxiosResponse } from "axios";
import EditablePhone from "./EditablePhone";
import { subscribe } from "diagnostics_channel";

export default function ProfileBar({ userProfile, submitPhone }:{ userProfile: User, submitPhone: (newPhone: string) => Promise<AxiosResponse<any, any>> }) {
    return (
        <div id="content" className="flex justify-between items-start gap-8">
            {/* Left Image*/}
            <div className="relative rounded-lg">
            <img
                alt="User Profile"
                className="inset-0 rounded-lg w-auto h-48"
                src={wood.src}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <img
                alt="User Profile"
                className="inset-0 rounded-lg h-[70%]"
                src={profilepic.src}
                />
            </div>
            </div>
            {/* User Info*/}
            <div className="text-[1.200rem] text-boc_darkbrown leading-loose flex-grow-0">
            <div className="text-[3.3rem] leading-tight text-boc_darkgreen font-funky">
                <b>
                {userProfile.firstName} {userProfile.lastName}
                </b>
            </div>
            <div className="text-2xl text-boc_green">
                {userProfile.role}
            </div>
            <div className="flex gap-12 text-xl mt-4">
                <div>
                    <b>EMAIL</b>
                    <p>{userProfile.email}</p>
                </div>
                <div className="w-48">
                    <b>PHONE NUMBER</b>
                    <EditablePhone currPhone={userProfile.phone} submitPhone={submitPhone}/>
                </div>
            </div>
            </div>
            {/* Flex Spacer */}
            <div className="flex-grow"></div>
            {/* Trips Badge */}
            <div className="w-1/5 text-center rounded-lg float-right">
            <p className="text-2xl font-bold text-boc_darkbrown">SUMMIT SEEKER</p>

            <div className="relative w-full">
                <img
                src={tripsBadge.src}
                alt="trips badge"
                className="w-full h-auto p-2"
                ></img>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-5xl px-4 py-2 rounded-lg">
                {userProfile.tripsParticipated + userProfile.tripsLead} {/*Currently, just adding trips lead to trips participated, but one day, we can hopefully split this*/}
                </div>
            </div>
            <div className="pb-7">
                <p className="text-2xl font-bold text-boc_darkbrown">TOTAL TRIPS</p>
            </div>
            </div>
        </div>
    );
}