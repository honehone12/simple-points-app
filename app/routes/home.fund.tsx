import { 
    ActionFunction, 
    LoaderFunction, 
    json, 
    redirect
} from "@remix-run/node"
import { useActionData } from "@remix-run/react";
import React, { useState } from "react";
import { FormField } from "~/components/form-field";
import { requireUserUuid } from "~/utils/auth.server"
import { fund } from "~/utils/balance.server";
import { StatusCode } from "~/utils/status-code.server";
import { validatePointCode } from "~/utils/validators.server";
import { fundUnit } from "~/utils/constants.server";
import { consumeCode, getCodeByUuid } from "~/utils/code.server";

export const loader: LoaderFunction = async ({request}) => {
    await requireUserUuid(request);
    return null;
};

export const action: ActionFunction = async ({request}) => {
    const user = await requireUserUuid(request);
    const form = await request.formData();
    const pointCode = form.get("pointcode");

    if (typeof pointCode !== "string") {
        return json(
            {error: "invalid form data"},
            {status: StatusCode.BadRequest}
        );
    }

    const err = validatePointCode(pointCode);
    if (err) {
        return json(
            {error: err},
            {status: StatusCode.BadRequest}
        );
    }

    const code = await getCodeByUuid(pointCode);
    if (!code || code.consumed) {
        return json(
            {error: "invalid code"},
            {status: StatusCode.BadRequest}
        );
    }

    try {
        await consumeCode(code.id, user.id);
        await fund(user.id, fundUnit);    
    } catch (e) {
        return json(
            {error: e},
            {status: StatusCode.BadRequest}
        );
    }
    
    return redirect("/home/balance");
};

export default function Fund() {
    const actionData = useActionData()
    const [formData, setFormData] = useState({pointcode: ""});

    const handleInput = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({pointcode: e.target.value});
    };

    return (
        <div>
            <div className="flex flex-col py-10 items-center justify-center">
                <h2 className="text-center text-4xl pb-10 font-extrabold text-pink-200">
                    Get Points 🎉
                </h2>
                <div className="rounded-2xl bg-gray-200 py-5 px-10 w-96">
                    <form method="post">
                        <FormField
                            htmlFor="pointcode"
                            label="PointCode"
                            value={formData.pointcode}
                            onChange={handleInput}
                            error={actionData?.error ?? ""}
                        />

                        <div className="w-full text-center">
                            <button
                                type="submit"
                                className="rounded-xl mt-2 bg-yellow-300 px-5 py-2 text-blue-800 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
                            >
                                Claim
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
