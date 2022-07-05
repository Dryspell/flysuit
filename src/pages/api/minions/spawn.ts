import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient({
    log: [{ level: "query", emit: "event" }],
    errorFormat: "pretty",
});

const getRandomArbitrary = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
};

export default async function spawn(req: NextApiRequest, res: NextApiResponse) {
    console.log(req.method, req.body);
    if (req.method === "POST") {
        // create spawn for minion
        const {
            userId,
            allies,
            enemies,
            position,
            random_pos,
            currentAction,
            atRestAction,
            team,
        } = req.body;
        // TODO: validate userId, allies, enemies, position, random_pos
        const IS_ADMIN = req.body.user.isAdmin || true;
        const radius = 10;

        const minion = IS_ADMIN
            ? await prisma.minion.create({
                  data: {
                      owner: userId,
                      allies: allies || ["ally"],
                      enemies: enemies || ["enemy"],
                      currentAction: currentAction || "idle",
                      atRestAction: atRestAction || "idle",
                      team: team || [],
                      locationData: {
                          position: {
                              type: "Point",
                              coordinates:
                                  position || random_pos
                                      ? {
                                            x: Math.floor(
                                                getRandomArbitrary(
                                                    -radius,
                                                    radius
                                                )
                                            ),
                                            y: Math.floor(
                                                getRandomArbitrary(
                                                    -radius,
                                                    radius
                                                )
                                            ),
                                        }
                                      : {
                                            x: 0,
                                            y: 0,
                                        },
                          },
                      },
                  },
              })
            : await prisma.minion.create({
                  data: {
                      owner: userId,
                  },
              });
        if (minion) {
            res.status(201).json({
                status: "success",
                data: {
                    minion,
                },
            });
        } else {
            res.status(400).json({
                status: "error",
                message: "Failed to create minion",
            });
            throw new Error("Failed to create minion");
        }
    } else {
        res.status(405).json({
            status: "error",
            message: "Method not allowed",
        });
    }
}
