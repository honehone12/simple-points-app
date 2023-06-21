import { Outlet } from "@remix-run/react";
import { Layout } from "~/components/layout";

export default function Home() {
    return (
        <Layout>
            <h2 className="text-center py-10 text-8xl">
            🤩
            </h2>
            <Outlet/>
        </Layout>
    );
}
