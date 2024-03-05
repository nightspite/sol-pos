import Link from "next/link";
import { Button } from "./ui/button";
import { FRONTEND_ROUTES } from "@/lib/routes";
import { type ReactNode } from "react";

export const FullscreenMessage = ({
  children,
  custom,
}: {
  children: ReactNode;
  custom?: boolean;
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background text-center text-2xl font-semibold">
      {children}
      {!custom ? (
        <Link href={FRONTEND_ROUTES.HOME}>
          <Button>Go home</Button>
        </Link>
      ) : null}
    </div>
  );
};
