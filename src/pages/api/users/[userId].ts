import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: [{ level: "query", emit: "event" }],
    errorFormat: "pretty",
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.method, req.body);
    if (req.method === "GET") {
        const { id } = req.query;
        if (!id) {
            res.status(400).json({
                status: "error",
                message: "User id is required",
            });
            throw new Error("User id is required");
        }
        const user = await prisma.user.findMany({
            where: { id: id as string },
        });
        console.log(user);
    }
};

export default handler;
