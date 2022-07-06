import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: [{ level: "query", emit: "event" }],
    errorFormat: "pretty",
});

const jwt = require("jsonwebtoken");

const generateToken = async (id: string) => {
    // console.log(`Generating token for user: ${id}`);

    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return token;
    // return await prisma.verificationToken.create({
    //     data: {
    //         identifier: id,
    //         token,
    //         expires: new Date(
    //             Date.now() + parseInt(String(process.env.JWT_EXPIRES_IN))
    //         ),
    //     },
    // });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.method, req.body);
    if (req.method === "POST") {
        const { name, email, password, confirm_password } = req.body;
        if (!password && !confirm_password) {
            res.status(400).json({
                status: "error",
                message: "Password and confirm password are required",
            });
            throw new Error("Password and confirm password are required");
        }
        if (password !== confirm_password) {
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

        const token = jwt.sign({ email, name }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        const user = await prisma.user
            .create({
                data: {
                    name,
                    email,
                    password,
                    verification_token: {
                        create: {
                            identifier: email,
                            token,
                            expires: new Date(
                                Date.now() +
                                    parseInt(String(process.env.JWT_EXPIRES_IN))
                            ),
                        },
                    },
                },
            })
            .catch((err) => {
                console.log(err);
                res.status(400).json({
                    status: "error",
                    message: "User already exists",
                });
            })
            .finally(async () => {
                await prisma.$disconnect();
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
