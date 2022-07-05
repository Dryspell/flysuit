import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: [{ level: "query", emit: "event" }],
    errorFormat: "pretty",
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.method, req.body);
    if (req.method === "POST") {
        const { name, email, password, confirmPassword } = req.body;
        if (!password && !confirmPassword) {
            res.status(400).json({
                status: "error",
                message: "Password and confirm password are required",
            });
            throw new Error("Password and confirm password are required");
        }
        if (password !== confirmPassword) {
            res.status(400).json({
                status: "error",
                message: "Password and confirm password do not match",
            });
            throw new Error("Password and confirm password do not match");
        }
        if (!name && !email) {
            res.status(400).json({
                status: "error",
                message: "Username or email are required",
            });
            throw new Error("Username or email are required");
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
            },
        });
        if (user) {
            res.status(201).json({
                status: "success",
                data: {
                    user,
                },
            });
        } else {
            res.status(400).json({
                status: "error",
                message: "Failed to create user",
            });
            throw new Error("Failed to create user");
        }
    }
};

export default handler;
