import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

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
    ],
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error", // Error code passed in query string as ?error=
        verifyRequest: "/auth/verify-request", // (used for check email message)
        newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
    },
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            return true;
        },
        async redirect({ url, baseUrl }) {
            return baseUrl;
        },
        async session({ session, token, user }) {
            return session;
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            return token;
        },
    },
    events: {
        async signIn(message) {
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
