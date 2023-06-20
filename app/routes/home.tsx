import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserUuid } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({request}) => {
    const user = await requireUserUuid(request);
    return user;
};

export default function Home() {
    const user = useLoaderData();
    return (
        <div>
            {user.id}<br/>
            {user.name}<br/>
            {user.email}<br/>
            {user.uuid}
        </div>
    );
}