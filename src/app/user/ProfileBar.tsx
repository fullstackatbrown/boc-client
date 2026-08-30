import { Role, User } from "@/models/models"
import tripsBadge from "@/assets/images/profile/badge.png";
import profilepic from "@/assets/images/profile/bear.png";
import wood from "@/assets/images/profile/wood.png";
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { AxiosResponse } from "axios";
import EditablePhone from "./EditablePhone";

const Badge = ({title, count, label} : {title: string, count: number, label: string} ) => (
	<>
            <div className="w-36 desktop:w-1/5 text-center rounded-lg float-right">
            <p className="text-lg desktop:text-2xl font-bold text-boc_darkbrown">{title}</p>

            <div className="relative w-full">
                <img
                src={tripsBadge.src}
                alt="trips badge"
                className="w-full h-auto p-2"
                ></img>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-3xl desktop:text-5xl px-4 py-2 rounded-lg">
		{count}
                </div>
            </div>
            <div className="pb-7">
                <p className="text-lg desktop:text-2xl font-bold text-boc_darkbrown">{label}</p>
            </div>
            </div>
	    </>
);

function Badges({ role, tripsParticipated, tripsLead } : {role: Role, tripsParticipated: number, tripsLead: number}) {
		//Admins lead trips too - checking for Leader alone hides this from most of the
		//people who have actually led anything
		const leads = role === Role.Leader || role === Role.Admin;
		return (
			//Below `desktop` the badges sit side by side in their own row; `desktop:contents`
			//dissolves this wrapper again so they stay direct flex children of the bar.
			<div className="flex justify-center gap-6 desktop:contents">
			{/* Pushes the badges to the right edge, however many of them there are */}
			<div className="hidden desktop:block flex-grow"></div>
			<Badge
				title="SUMMIT SEEKER"
				count={tripsParticipated + tripsLead}
				label="TOTAL TRIPS"
			/>

			{leads && (
				<Badge
					title="LEADER STATS"
					count={tripsLead}
					label="TRIPS LED"
				/>
			)}
			</div>
		);
}

export default function ProfileBar({ userProfile, submitPhone }:{ userProfile: User, submitPhone: (newPhone: string) => Promise<AxiosResponse<any, any>> }) {
    return (
        <div id="content" className="flex flex-col items-center text-center gap-8
        desktop:flex-row desktop:justify-between desktop:items-start desktop:text-left">
            {/* Left Image - the same placeholder for everyone, so phones skip it. `shrink-0`
                stops it collapsing to nothing between sm and desktop; at desktop the row
                does still squeeze it slightly, so shrinking has to come back. */}
            <div className="hidden sm:block relative rounded-lg shrink-0 desktop:shrink">
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
            {/* desktop:leading-tight restates the leading the sm:/desktop: text steps override */}
            <div className="text-[2.25rem] sm:text-5xl desktop:text-[3.3rem] leading-tight
            desktop:leading-tight text-boc_darkgreen font-funky">
                <b>
                {userProfile.firstName} {userProfile.lastName}
                </b>
            </div>
            <div className="text-2xl text-boc_green">
                {userProfile.role}
            </div>
            <div className="flex flex-col items-center gap-2 desktop:flex-row desktop:items-start
            desktop:gap-12 text-xl mt-4">
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
	    
	    <Badges
	    	role = {userProfile.role}
		tripsParticipated = {userProfile.tripsParticipated}
		tripsLead = {userProfile.tripsLead}
	    	/>

        </div>
    );
}
