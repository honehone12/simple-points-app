import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserUuid } from "~/utils/auth.server";
import { getBalanceByUserId } from "~/utils/balance.server";
import { maxInt64N } from "~/utils/constants.server";

export const loader: LoaderFunction = async ({request}) => {
    const user = await requireUserUuid(request);
    const balance = await getBalanceByUserId(user.id); 
    
    // need error page !!
    if (!balance || balance.point > maxInt64N) {
        throw new Error(`unexpected value is stored in balance: ${balance?.point}`);
    }
    
    const balanceUi = {
        id: balance.id,
        point: Number(balance?.point),
        userId: balance.userId
    };
    
    return {user, balanceUi};
};

export default function Balance() {
    const {user, balanceUi} = useLoaderData();

    return (
        <div>
            {user && balanceUi && (
                <div className="flex flex-col py-10 items-center justify-center">
                    <h2 className="text-center text-5xl pb-10 font-extrabold text-pink-200">
                        Your Points
                    </h2>
                    <div className="rounded-2xl bg-gray-200 py-5 px-10 w-96">
                        <div className="text-gray-800 font-semibold justify-center">
                            Name : {user.name} 👋<br/> 
                            Email: {user.email} ✉️
                        </div>
                    </div>
                    <div className="py-2"/>
                    <div className="rounded-2xl bg-gray-200 p-10 w-fit">
                        <div className=" text-gray-800 font-semibold text-4xl justify-center">
                            Point: {balanceUi.point} 👛
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
