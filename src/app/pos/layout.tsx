import { getServerAuthSession } from "@/server/auth";
import { FullscreenMessage } from "../components/fullscreen-message";
import { Navbar } from "../components/navbar";
import { FULL_HEIGHT } from "@/lib/constants";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "CASHIER") {
    return <FullscreenMessage>Unauthorized</FullscreenMessage>;
  }

  return <>{children}</>;
}
