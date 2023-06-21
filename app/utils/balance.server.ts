import { maxInt64N } from "./constants.server";
import { db } from "./db.server";
import { Balance } from "@prisma/client";

export const getBalanceByUserId = async (userId: number) => {
    return db.balance.findUnique({
        where: {userId: userId},
        select: {id: true, point: true, userId: true}
    });
};

export const updateBalance = async (id: number, balance: Partial<Balance>) => {
    return await db.balance.update({
        where: {id: id},
        data: balance
    });
};

export const fund = async (userId: number, value: number) => {
    return await db.$transaction(async (tx) => {
        const current = await tx.balance.findUnique({
            where: {userId: userId}
        });
        if (!current) {
            throw new Error(`no such user with id ${userId}`);
        }
        const valueN = BigInt(value)
        if (valueN > maxInt64N - current.point) {
            throw new Error("overflow");
        }

        return await tx.balance.update({
            where: {id: current.id},
            data: {
                point: current.point + valueN
            }
        });
    });
};

export const consume = async (userId: number, value: number) => {
    return await db.$transaction(async (tx) => {
        const current = await tx.balance.findUnique({
            where: {userId: userId},
        });
        if (!current) {
            throw new Error(`no such user with id ${userId}`);
        }
        const valueN = BigInt(value);
        if (value > current.point) {
            throw new Error("underflow");
        }

        return await tx.balance.update({
            where: {id: current.id},
            data: {
                point: current.point - valueN
            }
        });
    });
};
