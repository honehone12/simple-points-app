import React, {useState} from "react";
import { ActionFunction, json } from "@remix-run/node";
import { FormField } from "~/components/form-field";
import { Layout } from "~/components/layout";
import { StatusCode } from "~/utils/status-code.server";
import { validateEmail, validateName, validatePassword } from "~/utils/validators.server";

export const action: ActionFunction = async ({request}) => {
    const form = await request.formData();
    const action = form.get("_action");
    const email = form.get("email");
    const password = form.get("password");
    let name = form.get("name");

    if (typeof action !== "string" ||
        typeof email !== "string" || typeof password !== "string"
    ) {
        return json(
            {error: "invalid form data", form: action},
            {status: StatusCode.BadRequest}
        );
    }
    if (action === "register" && typeof name !== "string") {
        return json(
            {error: "invalid registration data", form: action},
            {status: StatusCode.BadRequest}
        );
    }
    
    const errors = {
        email: validateEmail(email),
        password: validatePassword(password),    
        ...(action === "register" ? {
            name: validateName((name as string) ?? "")
        } : {})
    };

    if (Object.values(errors).some(Boolean)) {
        return json(
            {
                errors,
                fields: {email, password, name},
                form: action
            },
            {status: StatusCode.BadRequest}
        );
    }

    switch (action) {
        case "login":
        case "register":
        default:
            return json(
                {error: "invalid form action", form: action},
                {status: StatusCode.BadRequest}
            );  
    }
};

export default function Login() {
    const [formData, setFormData] = useState({

    })
    
    const handleInput = (
        event: React.ChangeEvent<HTMLInputElement>,
        field: string
    ) => {

    };
    
    return (
        <Layout>
            <div className="h-full justify-center items-center flex flex-col gap-4">
                <h2 className="text-5xl font-extrabold text-pink-300">
                    Login
                </h2>

                <form method="post" className="rounded-2xl bg-gray-300 p-6 w-96">
                    <FormField
                        htmlFor="email"
                        label="Email"
                        value={""}
                        onChange={() =>{}}
                        error={""}
                    />
                    <FormField
                        htmlFor="password"
                        label="Password"
                        value={""}
                        onChange={() =>{}}
                        error={""}
                    />
                </form>

            </div>
        </Layout>
    );
}