import Link from "next/link"

export default function profile(){
    return (
        <div className="min-h-screen w-screen flex justify-center items-center">
            <div className="w-min-[500px] w-[80%]">
                <div className="w-full">
                    <h1 className="text-[4vmin] font-bold">User Profile</h1>
                    <div className="w-full h-[1px] bg-black "></div>
                </div>
                <div className="w-full pt-4">
                    <div className="flex flex-row gap-x-4">
                        <div className="w-[200px] h-[200px] bg-gray-200 rounded-lg"></div>
                        <div className="flex justify-around flex-col">
                            <div className="flex flex-row gap-x-2"><label className="font-bold ">Name:</label><p>John Doe</p></div>
                            <div className="flex flex-row gap-x-2"><label className="font-bold ">BOC Position:</label><p>John Doe</p></div>
                            <div className="flex flex-row gap-x-2"><label className="font-bold ">E-mail:</label><p>John Doe</p></div>
                            <div className="flex flex-row gap-x-2"><label className="font-bold ">Phone Number:</label><p>John Doe</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}