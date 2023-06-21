import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserUuid } from "~/utils/auth.server";
import { getBalanceByUserId } from "~/utils/balance.server";

export const loader: LoaderFunction = async ({request}) => {
    const user = await requireUserUuid(request);
    const balance = await getBalanceByUserId(user.id);
    return {user, balance};
};

export default function Balance() {
    const {user, balance} = useLoaderData();

    return (
        <div className="flex justify-center">
            {user && balance && (
                <div>
                    <h2 className="text-center text-5xl pb-5 font-extrabold text-pink-200">
                        Your Points
                    </h2>
                    <div className="rounded-2xl bg-gray-200 py-5 px-10 w-96">
                        <div className="text-gray-800 justify-center">
                            Name : {user.name} 👋<br/> 
                            Email: {user.email} ✉️
                        </div>
                    </div>
                    <div className="py-2"/>
                    <div className="rounded-2xl bg-gray-200 p-10 w-96">
                        <div className=" text-gray-800 text-2xl justify-center">
                            Point: {balance.point} 👛
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
