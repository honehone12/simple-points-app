import { 
    Code, 
    Prisma, 
    PrismaClient 
} from "@prisma/client";
import { CodeStatus } from "~/utils/code.server";

const db = new PrismaClient();

const seed = async () => {
    const promise: Prisma.Prisma__CodeClient<Code, never>[] = []; 
    for (let i = 0; i < 100; i++) {
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

seed();
