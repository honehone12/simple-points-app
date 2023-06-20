import React, {useEffect, useRef, useState} from "react";
import { 
    ActionFunction, 
    LoaderFunction, 
    json, 
    redirect 
} from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { FormField } from "~/components/form-field";
import { Layout } from "~/components/layout";
import { StatusCode } from "~/utils/status-code.server";
import { 
    validateEmail, 
    validateName, 
    validatePassword 
} from "~/utils/validators.server";
import { 
    getUser, 
    login, 
    register 
} from "~/utils/auth.server";

export const loader: LoaderFunction = async ({request}) => {
    return await getUser(request) ? redirect("/") : null
}

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
            return await login({email, password});
        case "register":
            name = name as string
            return await register({name, email, password})
        default:
            return json(
                {error: "invalid form action", form: action},
                {status: StatusCode.BadRequest}
            );  
    }
};

export default function Login() {
    const actionData = useActionData();
    const [action, setAction] = useState(actionData?.form || "login");
    const firstLoad = useRef(true);
    const [errors, setErrors] = useState(actionData?.errors || {});
    const [formError, setFormError] = useState(actionData?.error || "");
    const [formData, setFormData] = useState({
        name: actionData?.fields?.name || "",
        email: actionData?.fields?.email || "",
        password: actionData?.fields?.password || ""
    });

    useEffect(() => {
        if (!firstLoad.current) {
            setFormError("");
        }
    }, [formData]);

    useEffect(() => {
        firstLoad.current = false;
    }, []);
    
    const handleInput = (
        event: React.ChangeEvent<HTMLInputElement>,
        field: string
    ) => {
        setFormData((form) => ({
            ...form,
            [field]: event.target.value
        }));
    };

    const handleActionChange = () => {
        setAction(action === "login" ? "register" : "login");
        if (!firstLoad.current) {
            const newState = {
                name: "",
                email: "",
                password: ""
            };
            setErrors(newState);
            setFormData(newState);
            setFormError("");
        }
    };
    
    return (
        <Layout>
            <div className="h-full justify-center items-center flex flex-col gap-4">
                <div>
                    <h3 className="absolute top-10 right-32 text-gray-300">
                        {action === "login" ? "Don't have a account?" : "Already have a account?" }
                    </h3>
                    <button
                        onClick={handleActionChange}
                        className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-800 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
                    >
                        {action === "login" ? "Sign Up" : "Sign In"}
                    </button>
                </div>
                
                
                <h2 className="text-5xl font-extrabold text-pink-300">
                    Points App🪙
                </h2>

                <form method="post" className="rounded-2xl bg-gray-300 p-6 w-96">
                    <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full ">
                        {formError}
                    </div>
                    
                    {action === "register" && (
                        <FormField
                            htmlFor="name"
                            label="Name"
                            value={formData.name}
                            onChange={(e) => handleInput(e, "name")}
                            error={errors?.name}
                        />  
                    )}
                    
                    <FormField
                        htmlFor="email"
                        label="Email"
                        value={formData.email}
                        onChange={(e) => handleInput(e, "email")}
                        error={errors?.email}
                    />
                    <FormField
                        htmlFor="password"
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInput(e, "password")}
                        error={errors?.password}
                    />

                    <div className="w-full text-center">
                        <button
                            type="submit"
                            name="_action"
                            value={action}
                            className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-800 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
                        >
                            {action === "login" ? "Sign In" : "Sign Up"}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}