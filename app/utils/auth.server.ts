import { RegisterForm, LoginForm } from "./types.server";
import { db } from "./db.server";
import { 
    json,
    redirect, 
    createCookieSessionStorage 
} from "@remix-run/node";
import { StatusCode } from "./status-code.server";
import { createUser } from "./user.server";
import bcrypt from "bcryptjs";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
    cookie: {
        name: "spapp-session",
        secure: process.env.NODE_ENV === "production",
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        // this expiration is only for browser
        // should check some other updatedAt value in db 
        maxAge: 60 * 60,
        httpOnly: true
    }
});

export async function register(user: RegisterForm) {
    const exists = await db.user.count({
        where: {email: user.email}
    });
    if (exists) {
        return json(
            {error: "user already exists with that email"},
            {status: StatusCode.BadRequest}
        );
    }

    const newUser = await createUser(user);
    if (!newUser) {
        return json(
            {
                error: "something went wrong creating a new user",
                fields: {email: user.email, password: user.password}
            },
            {status: StatusCode.BadRequest}
        );
    }

    return createUserSession(newUser.uuid, "/");
}

export async function login({email, password}: LoginForm) {
    const user = await db.user.findUnique({
        where: {email}
    });

    if (
        !user || 
        !(await bcrypt.compare(password, user.passwordHash))
    ) {
        return json(
            {error: "incorrect login"},
            {status: StatusCode.BadRequest}
        );
    }

    return createUserSession(user.uuid, "/");
}

export async function createUserSession(uuid: string, redirectTo: string) {
    const session = await storage.getSession();
    session.set("uuid", uuid);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session)
        }
    });
}

export async function requireUserUuid(request: Request) {
    const uuid = await getUserUuid(request);
    if (!uuid) {
        throw redirect("/login");
    }

    let user;
    try {
        user = await db.user.findUnique({
            where: {uuid: uuid},
            select: {id: true, uuid: true, name: true, email: true}
        });
    } catch (e) {
        console.error(e);
        throw await logout(request);
    }

    if (!user) {
        throw await logout(request);
    }
    return user;
}

function getUserSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"));
}

async function getUserUuid(request: Request) {
    const session = await getUserSession(request);
    const uuid = session.get("uuid");
    if (!uuid || typeof uuid !== "string") {
        return null;
    }
    return uuid;
}

export async function getUser(request: Request) {
    const uuid = await getUserUuid(request);
    if (!uuid) {
        return null;
    }

    try {
        const user = await db.user.findUnique({
            where: {uuid: uuid},
            select: {id: true, uuid: true, name: true, email: true}
        });
        return user;
    } catch (e) {
        console.error(e);
        throw await logout(request);
    }
}

export async function logout(request: Request) {
    const session = await getUserSession(request);
    return redirect("/login", {
        headers: {
            "Set-Cookie": await storage.destroySession(session)
        }
    });
}
