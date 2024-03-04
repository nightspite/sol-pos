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

  if (session?.user?.role !== "ADMIN") {
    return <FullscreenMessage>Unauthorized</FullscreenMessage>;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden">
      <Navbar />
      <div
        className="relative mx-auto mt-8 w-full max-w-5xl overflow-hidden"
        style={{
          minHeight: FULL_HEIGHT,
        }}
      >
        {children}
      </div>
    </div>
  );
}
