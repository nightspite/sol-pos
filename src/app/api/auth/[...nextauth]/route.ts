import NextAuth from "next-auth";

import { authOptions } from "@/server/auth";
import { type NextApiRequest, type NextApiResponse } from "next";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   // const isDefaultSigninPage =
//   //   req.method === "GET" && req.query.nextauth?.includes("signin");

//   // Hides Sign-In with Solana from the default sign page
//   // if (isDefaultSigninPage) {
//   //   providers.pop();
//   // }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, authOptions);
};
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
