import { Outlet, Link } from "@remix-run/react";
import { Layout } from "~/components/layout";

export default function Home() {
    return (
        <Layout>
            <h2 className="text-center py-10 text-8xl">
            🤩
            </h2>
            <form 
                action="/logout"
                method="post"    
            >
                <button
                    type="submit"
                    className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-800 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
                >
                    Sign Out
                </button>
            </form>
            <div className="w-full justify-center items-center">
                <nav className="h-10 bg-gray-100 rounded-lg justify-center mx-2 flex space-x-10">
                    <Link 
                        to="/home/balance"
                        className="mb-1 text-xl text-red-500 font-bold duration-300 hover:scale-105 hover:border-b-4 border-yellow-400"
                    >Balance</Link>
                    <Link 
                        to="/home/send"
                        className="mb-1 text-xl text-red-500 font-bold duration-300 hover:scale-105 hover:border-b-4 border-yellow-400"
                    >Send</Link>
                    <Link 
                        to="/home/fund"
                        className="mb-1 text-xl text-red-500 font-bold duration-300 hover:scale-105 hover:border-b-4 border-yellow-400"
                    >Claim</Link>
                </nav>
            </div>
            <Outlet/>
        </Layout>
    );
}
