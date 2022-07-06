import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: [{ level: "query", emit: "event" }],
    errorFormat: "pretty",
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.method, req.body);
    if (req.method === "POST") {
        const { id, name, email, password } = req.body;
        if (!password) {
            res.status(400).json({
                status: "error",
                message: "Password is required",
            });
            throw new Error("Password is required");
        }
        if (!name && !email) {
            res.status(400).json({
                status: "error",
                message: "Username or email are required",
            });
            throw new Error("Username or email are required");
        }
        const user = await prisma.user.findMany({
            where: {
                OR: [{ email }, { name }],
            },
        });
        console.log(user);
    }
};

export default handler;
