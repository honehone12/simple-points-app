import {getRandomValues} from "crypto";
import { db } from "./db.server";
import { passcodeBytesLen } from "./constants.server";

export const createOneTimePass = () => {
    const rndA = new Uint8Array(passcodeBytesLen);
    getRandomValues(rndA);

    const rndStr = Object.entries(rndA)
        .map((v) => v[1])
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
    return rndStr;
};

export const getStoredOneTimePass = async (userId: number) => {
    return await db.oneTimePass.findUnique({
        where: {userId: userId},
        select: {
            pass: true,
            updatedAt: true
        }
    });
};

export const setOneTimePass = async (userId: number, pass?: string) => {
    if (!pass) {
        pass = "";
    }
    return await db.oneTimePass.update({
        where: {userId: userId},
        data: {pass: pass}
    });
};
