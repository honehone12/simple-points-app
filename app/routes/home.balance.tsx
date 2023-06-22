import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserUuid } from "~/utils/auth.server";
import { getBalanceByUserId } from "~/utils/balance.server";
import { maxInt64N } from "~/utils/constants.server";

export const loader: LoaderFunction = async ({request}) => {
    const user = await requireUserUuid(request);
    const balanceN = await getBalanceByUserId(user.id); 
    
    // need error page !!
    if (!balanceN || balanceN.point > maxInt64N) {
        throw new Error(`unexpected value is stored in balance: ${balanceN?.point}`);
    }
    
    // need serializing library for Bigint etc (see remix github issue)
    // but value of balance here is less than equal max64
    // and can safely cast to number
    const balance = {
        id: balanceN.id,
        point: Number(balanceN.point),
        userId: balanceN.userId
    };
    
    return {user, balance};
};

export default function Balance() {
    const {user, balance} = useLoaderData();

    return (
        <div>
            {user && balance && (
                <div className="flex flex-col py-10 items-center justify-center">
                    <h2 className="text-center text-5xl pb-10 font-extrabold text-pink-200">
                        Your Points
                    </h2>
                    <div className="rounded-2xl bg-gray-200 py-5 px-10 w-fit">
                        <div className="text-gray-800 font-semibold justify-center">
                            Name : {user.name} 👋<br/> 
                            Email: {user.email} ✉️
                        </div>
                    </div>
                    <div className="py-2"/>
                    <div className="rounded-2xl bg-gray-200 p-10 w-fit">
                        <div className=" text-gray-800 font-semibold text-4xl justify-center">
                            Point: {balance.point} 👛
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
