import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "@/env";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/hash";

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
      username: string;
      name: string | null;
      role: "ADMIN" | "CASHIER";
    }
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          // return null;
          throw new Error("Invalid credentials");
        }

        const user = await db.query.userTable.findFirst({
          where: (u) => eq(u.username, credentials?.username ?? ''),
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (user.password !== hashPassword(credentials?.password)) {
          throw new Error("Invalid password");
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = user;

        return {...rest}
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
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
    // signOut: "/signout",
    // verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    session: async ({session, token}) => {

      const user = await db.query.userTable.findFirst({
        where: (u) => eq(u.id, token?.sub ?? ''),
      });

      if (!user) {
        return session;
        // return null;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;

      return {
        ...session,
        user: {
          ...session.user,
          ...rest,
        }
      };
    },
    // jwt(data) {
    //   console.log('jwt', data);

    //   return data.token;
    // },
    // signIn(data) {
    //   console.log('signIn', data);
    //   return true;
    // }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  // jwt: {
  //   maxAge: 24 * 60 * 60, // 1 day
  // },
  secret: env.NEXTAUTH_SECRET,
  // adapter: DrizzleAdapter(db, createTable) as Adapter,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
