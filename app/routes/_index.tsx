import type { V2_MetaFunction } from "@remix-run/node";
import { LoaderFunction, redirect } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Remix-Points App" },
    { name: "description", content: "Welcome to Remix-Points!" },
  ];
};

export const loader: LoaderFunction = async ({request}) => {
  return redirect("/login");
};
