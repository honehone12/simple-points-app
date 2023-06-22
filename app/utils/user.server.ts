import bcrypt from "bcryptjs"
import type { RegisterForm } from "./types.server"
import { db } from "./db.server"

export const createUser = async (user: RegisterForm) => {
    const passwordHash = await bcrypt.hash(user.password, 14);
    const newUser = await db.user.create({
        data: {
            name: user.name,
            email: user.email,
            passwordHash: passwordHash,
            balance: {
                create: {
                    point: 0
                }
            }
        }
    });
    return {id: newUser.id, uuid: newUser.uuid};
}

export const getUserById = async (userId: number) => {
    return await db.user.findUnique({
        where: {id: userId},
        select: {
            id: true, 
            uuid: true, 
            name: true, 
            email: true
        }
    });
}

export const getUserIdByEmail = async (email: string) => {
    return await db.user.findUnique({
        where: {email: email},
        select: {id: true}
    });
}

export const updateUserName = async (userId: number, newName: string) => {
    return await db.user.update({
        where: {id: userId},
        data: {name: newName}
    });
};

export const deleteUser = async (id: number) => {
    await db.user.delete({where: {id}});
};
