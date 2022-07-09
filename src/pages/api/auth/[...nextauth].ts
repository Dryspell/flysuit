import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
// import EmailProvider from `next-auth/providers/email`

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers

    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        // ...add more providers here
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                name: {
                    label: "Name",
                    type: "text",
                    placeholder: "Enter your name",
                },
            },
            async authorize(credentials, _req) {
                const user = { id: 1, name: credentials?.name ?? "J Smith" };
                return user;
            },
        }),
        // EmailProvider({
        //     server: process.env.EMAIL_SERVER,
        //     from: process.env.EMAIL_FROM,
        //     // maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
        // }),
    ],
    // pages: {
    //     signIn: "/auth/signin",
    //     signOut: "/auth/signout",
    //     error: "/auth/error", // Error code passed in query string as ?error=
    //     verifyRequest: "/auth/verify-request", // (used for check email message)
    //     newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
    // },
    callbacks: {
        //@ts-ignore
        callbacks: {
            async signIn({
                user,
                account,
                profile,
                email,
                credentials,
            }: {
                user: string;
                account: string;
                profile: string;
                email: string;
                credentials: {
                    password?: string;
                    token?: string;
                };
            }) {
                if (credentials?.password || credentials?.token) {
                    // console.log(`Signing in with password for user: ${user}`);

                    // credentials.password? userQuery.where.password = credentials.password} : credentials.token],

                    const loggedInUser = await prisma.user
                        .findFirst({
                            where: {
                                OR: [{ email: email }, { name: user }],
                            },
                            include: {
                                verification_token: true,
                            },
                        })
                        .then((user) => {
                            if (user) {
                                console.log(`User found: ${user.id}`);
                                if (
                                    credentials.token?.toString() ===
                                        user.verification_token?.token.toString() ||
                                    credentials.password?.toString() ===
                                        user.password?.toString()
                                ) {
                                    console.log(`User verified: ${user.id}`);
                                    return user;
                                }
                            } else {
                                console.log(`User not found: ${user}`);
                                return null;
                            }
                        });

                    const isAllowedToSignIn = loggedInUser ? true : false;
                    if (isAllowedToSignIn) {
                        return true;
                    } else {
                        // Return false to display a default error message
                        return false;
                        // Or you can return a URL to redirect to:
                        // return '/unauthorized'
                    }
                }
            },
            // async redirect({ url, baseUrl }) {
            //     return baseUrl;
            // },
            // async session({ session, token, user }) {
            //     return session;
            // },
            // async jwt({ token, user, account, profile, isNewUser }) {
            //     return token;
            // },
        },
    },
    events: {
        async signIn(message) {
            console.log(`Sign in event: ${message}`);
            /* on successful sign in */
        },
        async signOut(message) {
            /* on signout */
        },
        async createUser(message) {
            /* user created */
        },
        async updateUser(message) {
            /* user updated - e.g. their email was verified */
        },
        async linkAccount(message) {
            /* account (e.g. Twitter) linked to a user */
        },
        async session(message) {
            /* session is active */
        },
    },

    // logger: {
    //     error(code, metadata) {
    //         log.error(code, metadata);
    //     },
    //     warn(code) {
    //         log.warn(code);
    //     },
    //     debug(code, metadata) {
    //         log.debug(code, metadata);
    //     },
    // },

    // theme: {
    //     colorScheme: "auto", // "auto" | "dark" | "light"
    //     brandColor: "", // Hex color code
    //     logo: "", // Absolute URL to image
    //     buttonText: "", // Hex color code
    // },
};

export default NextAuth(authOptions);
