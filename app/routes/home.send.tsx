import { 
    ActionFunction, 
    LoaderFunction, 
    json, 
    redirect 
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import React, { useState } from "react";
import { FormField } from "~/components/form-field";
import { requireUserUuid } from "~/utils/auth.server";
import { transfer } from "~/utils/balance.server";
import { 
    createOneTimePass, 
    getStoredOneTimePass, 
    setOneTimePass 
} from "~/utils/oneTimePass.server";
import { StatusCode } from "~/utils/status-code.server";
import { getUserIdByEmail } from "~/utils/user.server";
import { 
    validateEmail, 
    validateOneTimePass, 
    validateUnsignedNumber 
} from "~/utils/validators.server";

export const loader: LoaderFunction = async ({request}) => {
    const user = await requireUserUuid(request);
    const oneTimePass = createOneTimePass();
    await setOneTimePass(user.id, oneTimePass);
    return {oneTimePass};
};

export const action: ActionFunction = async ({request}) => {
    const fromUser = await requireUserUuid(request);
    const form = await request.formData();
    const to = form.get("to");
    const amountStr = form.get("amount");
    const oneTimePass = form.get("oneTimePass")

    if (typeof to !== "string" || 
        typeof amountStr !== "string" || typeof oneTimePass !== "string"
    ) {
        await setOneTimePass(fromUser.id);
        return json(
            {error: "invalid form data"},
            {status: StatusCode.BadRequest}
        );
    }

    let amount = 0;
    try {
        amount = parseInt(amountStr);
    } catch (e) {
        await setOneTimePass(fromUser.id);
        return json(
            {error: "invalid form data"},
            {status: StatusCode.BadRequest}
        );
    }

    let errors = {
        to: validateEmail(to),
        amount: validateUnsignedNumber(amount),
        oneTimePass: validateOneTimePass(oneTimePass)
    };

    if (Object.values(errors).some(Boolean)) {
        await setOneTimePass(fromUser.id);
        return json(
            {
                errors,
                fields: {to, amount}
            }, 
            {status: StatusCode.BadRequest}
        );
    }

    const storedPass = await getStoredOneTimePass(fromUser.id);
    const now = Date.now();
    if (!storedPass || !storedPass.pass || 
        storedPass.pass !== oneTimePass ||
        now > storedPass.updatedAt.getTime() + 1000 * 60 * 3 // 3min
    ) {
        await setOneTimePass(fromUser.id);
        errors.oneTimePass = "invalid passcode";
        return json(
            {
                errors,
                fields: {to, amount}
            }, 
            {status: StatusCode.BadRequest}
        );
    }

    const toUser = await getUserIdByEmail(to);
    if (!toUser) {
        await setOneTimePass(fromUser.id);
        errors.to = `no such user email: ${to}`;
        return json(
            {
                errors,
                fields: {to, amount}
            }, 
            {status: StatusCode.BadRequest}
        );
    }

    try {
        await setOneTimePass(fromUser.id);
        await transfer(fromUser.id, toUser.id, amount);
    } catch (e) {
        return json(
            {error: "invalid form data"},
            {status: StatusCode.BadRequest}
        );
    }

    return redirect("/home/balance");
};

export default function Send() {
    const {oneTimePass} = useLoaderData()
    const actionData = useActionData();
    const [formData, setFormData] = useState({
        to: actionData?.fields?.to || "",
        amount: actionData?.fields?.amount || "",
        oneTimePass: ""
    });
    const errors = actionData?.errors;
    const formError = actionData?.error;
    const [copied, setCopied] = useState("Click to copy");

    const oneTimePassStr = oneTimePass as string

    const handleInput = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: string
    ) => {
        setFormData((data) => ({
            ...data,
            [field]: e.target.value
        }));
    };

    const copyToClipboard = (s: string) => {
        navigator.clipboard.writeText(s);
        setCopied("Copied !!");
    };

    return (
        <div>
            <div className="flex flex-col py-10 items-center justify-center">
                <h2 className="text-center text-4xl pb-10 font-extrabold text-pink-200">
                    Send Points 🫰
                </h2>
                <h4 className="text-center text-xl pb-2 font-extrabold text-pink-200">
                    Please copy this one-time passcode.
                </h4>
                <div
                    onClick={() => copyToClipboard(oneTimePassStr)} 
                    className="rounded-2xl bg-gray-200 py-5 px-10 w-fix  font-semibold text-blue-900"
                >
                    {oneTimePassStr}
                </div>
                <h4 className="text-center mb-10 pb-2 font-semibold text-pink-200">
                    {/* don't want to change layout */}
                    {copied}
                </h4>
                <div className="rounded-2xl bg-gray-200 py-5 px-10 w-96">
                    <form method="post">
                        <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full ">
                            {formError}
                        </div>
                        <FormField
                            htmlFor="to"
                            label="To"
                            type="email"
                            value={formData.to}
                            onChange={(e) => handleInput(e, "to")}
                            error={errors?.to}
                        />
                        <FormField
                            htmlFor="amount"
                            label="Amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => handleInput(e, "amount")}
                            error={errors?.amount}
                        />
                        <FormField
                            htmlFor="oneTimePass"
                            label="OneTimePasscode"
                            type="text"
                            value={formData.oneTimePass}
                            onChange={(e) => handleInput(e, "oneTimePass")}
                            error={errors?.oneTimePass}
                        />

                        <div className="w-full text-center">
                            <button
                                type="submit"
                                className="rounded-xl mt-2 bg-yellow-300 px-5 py-2 text-blue-800 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
