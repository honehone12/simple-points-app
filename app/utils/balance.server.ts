import { db } from "./db.server";
import { Balance } from "@prisma/client";

export const getBalanceByUserId = async (userId: number) => {
    return db.balance.findUnique({
        where: {userId: userId},
        select: {id: true, point: true, userId: true}
    });
};

export const updateBalance = async (id: number, balance: Partial<Balance>) => {
    await db.balance.update({
        where: {
            id: id
        },
        data: balance
    });
};
