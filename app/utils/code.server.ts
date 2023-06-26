import { Code, Prisma } from "@prisma/client";
import { db } from "./db.server";

export enum CodeStatus {
    Available = 0,
    Consumed = 1
}

export const createCodes = async (numCreate: number) => {
    const promise: Prisma.Prisma__CodeClient<Code, never>[] = []; 
    for (let i = 0; i < numCreate; i++) {
        const p = db.code.create({
            data: {
                consumed: CodeStatus.Available,
                consumer: 0
            }
        });
        promise.push(p);      
    }
    await Promise.all(promise).catch(
        (e) => {throw new Error(e);}
    );
};

export const getCodeByUuid = async (uuid: string) => {
    return await db.code.findUnique({
        where: {uuid: uuid},
        select: {
            id: true,
            consumed: true,
        }
    })
};

export const consumeCode = async (codeId: number, userId: number) => {
    await db.code.update({
        where: {id: codeId},
        data: {
            consumed: CodeStatus.Consumed,
            consumer: userId
        }
    });
};
