import { unstable_noStore as noStore } from "next/cache";

import { getServerAuthSession } from "@/server/auth";
import { AuthButton } from "./components/auth-button";
import Link from "next/link";
import { Button } from "./components/ui/button";
import { FRONTEND_ROUTES } from "@/lib/routes";

export default async function Home() {
  noStore();
  const session = await getServerAuthSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-2xl font-semibold">
              Solana Point of Sale System
            </div>
            <p className="text-center text-lg">
              {session && <span>Logged in as {session.user?.name}</span>}
            </p>
            {session?.user?.role === "ADMIN" ? (
              <Link href={FRONTEND_ROUTES.ADMIN}>
                <Button variant="outline">Admin Panel</Button>
              </Link>
            ) : null}
            {session?.user?.role === "ADMIN" ||
            session?.user?.role === "CASHIER" ? (
              <Link href={FRONTEND_ROUTES.POS}>
                <Button variant="outline">Select PoS</Button>
              </Link>
            ) : null}
            <AuthButton />
          </div>
        </div>
      </div>
    </main>
  );
}
