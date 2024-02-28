import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SigninMessage } from "@/lib/sign-message";

import { env } from "@/env";
import { db } from "@/server/db";
import { createTable } from "@/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: "Solana",
    credentials: {
      message: {
        label: "Message",
        type: "text",
      },
      signature: {
        label: "Signature",
        type: "text",
      },
    },
    async authorize(credentials, req) {
      try {
        const signinMessage = new SigninMessage(
          JSON.parse(credentials?.message ?? "{}") as SigninMessage
        );
        const nextAuthUrl = new URL(env.NEXTAUTH_URL);
        if (signinMessage.domain !== nextAuthUrl.host) {
          return null;
        }

        const csrfToken = await getCsrfToken({ req: { ...req, body: null } });

        if (signinMessage.nonce !== csrfToken) {
          return null;
        }

        const validationResult = await signinMessage.validate(
          credentials?.signature ?? ""
        );

        if (!validationResult)
          throw new Error("Could not validate the signed message");

        return {
          id: signinMessage.publicKey,
        };
      } catch (e) {
        return null;
      }
    },
  }),
  /**
   * ...add more providers here.
   *
   * Most other providers require a bit more work than the Discord provider. For example, the
   * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
   * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
   *
   * @see https://next-auth.js.org/providers/github
   */
];

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => ({
      session: {...session,
        publicKey: token.sub,
      },
      expires: session.expires,
      user: {
        ...session.user,
        name: token.sub,
      },
    }),
  },
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
  adapter: DrizzleAdapter(db, createTable) as Adapter,
  providers,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
