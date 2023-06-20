import { db } from "./db.server";
import { Balance } from "@prisma/client";

export const updateBalance = async (
    userId: number,
    balance: Partial<Balance>
) => {
    await db.user.update({
        where: {
            id: userId
        },
        data: {
            balance: {
                update: balance
            }
        }
    });
};
