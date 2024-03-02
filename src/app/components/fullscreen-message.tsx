import Link from "next/link";
import { Button } from "./ui/button";
import { FRONTEND_ROUTES } from "@/lib/routes";
import { type ReactNode } from "react";

export const FullscreenMessage = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 text-center text-2xl font-semibold">
      {children}
      <Link href={FRONTEND_ROUTES.HOME}>
        <Button>Go home</Button>
      </Link>
    </div>
  );
};
